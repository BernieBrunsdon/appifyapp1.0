// Firebase Authentication Service
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  reload
} from 'firebase/auth';
import { auth } from './config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

// Auth state management
let currentUser = null;
let authStateListeners = [];

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  authStateListeners.forEach(listener => listener(user));
});

// Subscribe to auth state changes
export const onAuthStateChange = (callback) => {
  authStateListeners.push(callback);
  // Return unsubscribe function
  return () => {
    const index = authStateListeners.indexOf(callback);
    if (index > -1) {
      authStateListeners.splice(index, 1);
    }
  };
};

// Get current user
export const getCurrentUser = () => currentUser;

// Check if user is authenticated and email is verified
export const isAuthenticated = () => {
  return !!currentUser && currentUser.emailVerified;
};

// Check if user is authenticated but email not verified
export const isAuthenticatedButUnverified = () => {
  return !!currentUser && !currentUser.emailVerified;
};

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Register new user with email verification enforcement
export const registerUser = async (email, password, userData = {}) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Validate password strength
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with additional data
    await updateProfile(user, {
      displayName: userData.name || userData.agentName || 'User'
    });
    
    // Send email verification immediately
    await sendEmailVerification(user);
    
    // Save user data to Firestore with emailVerified: false
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: userData.name || userData.agentName || 'User',
      createdAt: new Date().toISOString(),
      emailVerified: false,
      plan: userData.plan || 'free',
      ...userData
    });
    
    return { 
      success: true, 
      user, 
      message: 'Account created successfully! Please check your email and click the verification link to activate your account.',
      requiresVerification: true
    };
    
  } catch (error) {
    let errorMessage = 'Registration failed. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please choose a stronger password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email registration is currently disabled. Please contact support.';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Sign in user with email verification check
export const signInUser = async (email, password) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if email is verified
    if (!user.emailVerified) {
      // Sign out the user since email is not verified
      await signOut(auth);
      return { 
        success: false, 
        error: 'Please verify your email address before signing in. Check your inbox for the verification email.',
        requiresVerification: true
      };
    }
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    return { success: true, user, userData };
    
  } catch (error) {
    let errorMessage = 'Sign in failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address. Please check your email or create a new account.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Sign out failed. Please try again.' };
  }
};

// Resend email verification
export const resendEmailVerification = async () => {
  try {
    if (!currentUser) {
      return { success: false, error: 'No user is currently signed in.' };
    }
    
    await sendEmailVerification(currentUser);
    return { success: true, message: 'Verification email sent! Please check your inbox.' };
    
  } catch (error) {
    return { success: false, error: 'Failed to send verification email. Please try again.' };
  }
};

// Check email verification status
export const checkEmailVerification = async () => {
  try {
    if (!currentUser) {
      return { success: false, error: 'No user is currently signed in.' };
    }
    
    // Reload user to get latest verification status
    await reload(currentUser);
    
    return { 
      success: true, 
      emailVerified: currentUser.emailVerified,
      message: currentUser.emailVerified ? 'Email is verified!' : 'Email verification required.'
    };
    
  } catch (error) {
    return { success: false, error: 'Failed to check verification status.' };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent! Please check your inbox.' };
    
  } catch (error) {
    let errorMessage = 'Failed to send password reset email. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    if (!currentUser) {
      return { success: false, error: 'No user is currently signed in.' };
    }
    
    // Update Firebase Auth profile
    if (updates.displayName) {
      await updateProfile(currentUser, {
        displayName: updates.displayName
      });
    }
    
    // Update Firestore document
    await updateDoc(doc(db, 'users', currentUser.uid), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update profile. Please try again.' };
  }
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};

// Check if email is already registered
export const checkEmailExists = async (email) => {
  // This is a simple check - in production, you might want to use a Cloud Function
  // For now, we'll rely on the registration error handling
  return false;
};

const authService = {
  registerUser,
  signInUser,
  signOutUser,
  resetPassword,
  resendEmailVerification,
  checkEmailVerification,
  updateUserProfile,
  getUserData,
  checkEmailExists,
  getCurrentUser,
  isAuthenticated,
  isAuthenticatedButUnverified,
  onAuthStateChange
};

export default authService;