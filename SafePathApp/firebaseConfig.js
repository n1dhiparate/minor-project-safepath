// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import environment variables from .env
import { 
  EXPO_PUBLIC_FIREBASE_API_KEY, 
  EXPO_MNM_PROJECT_ID, 
  EXPO_MNM_MESSAGING_SENDER_ID, 
  EXPO_MNM_APP_ID 
} from '@env';

// Firebase configuration using env variables
const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${EXPO_MNM_PROJECT_ID}.firebaseapp.com`,
  projectId: EXPO_MNM_PROJECT_ID,
  storageBucket: `${EXPO_MNM_PROJECT_ID}.appspot.com`,
  messagingSenderId: EXPO_MNM_MESSAGING_SENDER_ID,
  appId: EXPO_MNM_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Default export
export default app;
