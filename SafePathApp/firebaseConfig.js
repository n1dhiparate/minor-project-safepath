// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxLd97p6yVqOAm61W1Ooze_ejI1sDPvNk",
  authDomain: "safepathapp.firebaseapp.com",
  projectId: "safepathapp",
  storageBucket: "safepathapp.firebasestorage.app",
  messagingSenderId: "574601310005",
  appId: "1:574601310005:web:135a38199601276977e67c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
