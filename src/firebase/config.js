// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase config object
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBOwDjhOY8B5YNwQrrKgOIn-yb1k_iET54",
  authDomain: "appify-app.firebaseapp.com",
  projectId: "appify-app",
  storageBucket: "appify-app.firebasestorage.app",
  messagingSenderId: "883487161655",
  appId: "1:883487161655:web:0536e947e4acefdc2caeb2",
  measurementId: "G-W70SMBLQ6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
