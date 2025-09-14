// Firebase Authentication Service
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User
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

// Check if user is authenticated
export const isAuthenticated = () => !!currentUser;

// Register new user
export const registerUser = async (email, password, userData = {}) => {
  try {
    console.log('🔐 Registering user with email:', email);
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with additional data
    await updateProfile(user, {
      displayName: userData.name || userData.agentName || 'User'
    });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: userData.name || userData.agentName || 'User',
      createdAt: new Date().toISOString(),
      emailVerified: false,
      plan: userData.plan || 'free',
      ...userData
    });
    
    console.log('✅ User registered successfully:', user.uid);
    return { success: true, user, message: 'Account created successfully! Please check your email to verify your account.' };
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Sign in user
export const signInUser = async (email, password) => {
  try {
    console.log('🔐 Signing in user:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    console.log('✅ User signed in successfully:', user.uid);
    return { success: true, user, userData };
    
  } catch (error) {
    console.error('❌ Sign in error:', error);
    
    let errorMessage = 'Sign in failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email. Please check your email or create a new account.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      default:
        errorMessage = error.message || error.message || errorMessage;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    console.log('🔐 Signing out user');
    await signOut(auth);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('agentData');
    
    console.log('✅ User signed out successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { success: false, error: 'Sign out failed. Please try again.' };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    console.log('🔐 Sending password reset email to:', email);
    
    await sendPasswordResetEmail(auth, email);
    
    console.log('✅ Password reset email sent successfully');
    return { success: true, message: 'Password reset email sent! Please check your inbox.' };
    
  } catch (error) {
    console.error('❌ Password reset error:', error);
    
    let errorMessage = 'Failed to send password reset email. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email. Please check your email or create a new account.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Resend email verification
export const resendEmailVerification = async () => {
  try {
    if (!currentUser) {
      return { success: false, error: 'No user is currently signed in.' };
    }
    
    console.log('🔐 Resending email verification');
    await sendEmailVerification(currentUser);
    
    console.log('✅ Email verification sent successfully');
    return { success: true, message: 'Verification email sent! Please check your inbox.' };
    
  } catch (error) {
    console.error('❌ Email verification error:', error);
    return { success: false, error: 'Failed to send verification email. Please try again.' };
  }
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    if (!currentUser) {
      return { success: false, error: 'No user is currently signed in.' };
    }
    
    console.log('🔐 Updating user profile');
    
    // Update Firebase Auth profile
    await updateProfile(currentUser, updates);
    
    // Update Firestore document
    await updateDoc(doc(db, 'users', currentUser.uid), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ User profile updated successfully');
    return { success: true, message: 'Profile updated successfully!' };
    
  } catch (error) {
    console.error('❌ Profile update error:', error);
    return { success: false, error: 'Failed to update profile. Please try again.' };
  }
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};

// Check if email is already registered
export const checkEmailExists = async (email) => {
  try {
    // This is a simple check - in production, you might want to use a Cloud Function
    // For now, we'll rely on the registration error handling
    return false;
  } catch (error) {
    console.error('❌ Error checking email:', error);
    return false;
  }
};

export default {
  registerUser,
  signInUser,
  signOutUser,
  resetPassword,
  resendEmailVerification,
  updateUserProfile,
  getUserData,
  checkEmailExists,
  getCurrentUser,
  isAuthenticated,
  onAuthStateChange
};