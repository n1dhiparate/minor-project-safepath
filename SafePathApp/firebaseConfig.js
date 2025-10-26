// firebaseConfig.js

// ✅ Import Firebase core functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Import environment variables from .env file
import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_MNM_PROJECT_ID,
  EXPO_MNM_MESSAGING_SENDER_ID,
  EXPO_MNM_APP_ID,
  EXPO_MNM_CLIENT_ID,
} from "@env";

// ✅ Firebase configuration using your environment variables
const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${EXPO_MNM_PROJECT_ID}.firebaseapp.com`,
  projectId: EXPO_MNM_PROJECT_ID,
  storageBucket: `${EXPO_MNM_PROJECT_ID}.appspot.com`,
  messagingSenderId: EXPO_MNM_MESSAGING_SENDER_ID,
  appId: EXPO_MNM_APP_ID,
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Google Client ID for Expo Google Auth
const clientId =
  EXPO_MNM_CLIENT_ID ||
  "574601310005-bjv2p7gh6s6dci84dlslviq3t57kpmo4.apps.googleusercontent.com";

// ✅ Exports
export { auth, db, clientId };
export default app;
