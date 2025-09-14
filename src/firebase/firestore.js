// Firebase Firestore Service
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// User Management
export const createUserProfile = async (uid, userData) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (uid, userData) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...userData,
      lastUpdated: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Assistant Management
export const saveAssistantSettings = async (uid, assistantData) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      assistantSettings: assistantData,
      lastUpdated: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const saveAssistantId = async (uid, assistantId) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      assistantId: assistantId,
      lastUpdated: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Call Logs Management
export const saveCallLog = async (uid, callData) => {
  try {
    await addDoc(collection(db, 'users', uid, 'callLogs'), {
      ...callData,
      timestamp: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCallLogs = async (uid, limitCount = 50) => {
  try {
    const callLogsRef = collection(db, 'users', uid, 'callLogs');
    const q = query(callLogsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const callLogs = [];
    querySnapshot.forEach((doc) => {
      callLogs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: callLogs };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Analytics Management
export const saveAnalytics = async (uid, analyticsData) => {
  try {
    await setDoc(doc(db, 'users', uid, 'analytics', 'current'), {
      ...analyticsData,
      lastUpdated: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAnalytics = async (uid) => {
  try {
    const analyticsDoc = await getDoc(doc(db, 'users', uid, 'analytics', 'current'));
    if (analyticsDoc.exists()) {
      return { success: true, data: analyticsDoc.data() };
    } else {
      return { success: false, error: 'Analytics not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Demo Booking Management
export const saveDemoBooking = async (demoData) => {
  try {
    await addDoc(collection(db, 'demoBookings'), {
      ...demoData,
      timestamp: serverTimestamp(),
      status: 'pending'
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

