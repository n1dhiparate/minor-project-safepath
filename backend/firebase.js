// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import fs from "fs";
import admin from "firebase-admin";

// ✅ Frontend Firebase configuration (optional)
const firebaseConfig = {
  apiKey: "AIzaSyD__dtg2e10sUZygT1i_gRpvLXpwgV-uRg",
  authDomain: "safe-path-mnm.firebaseapp.com",
  projectId: "safe-path-mnm",
  storageBucket: "safe-path-mnm.firebasestorage.app",
  messagingSenderId: "159592505825",
  appId: "1:159592505825:web:3930c17cdfc0dfaa9f72a0"
};

// Initialize Firebase (client SDK)
const app = initializeApp(firebaseConfig);

// ✅ Load the service account key for admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

// ✅ Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://safe-path-mnm-default-rtdb.asia-southeast1.firebasedatabase.app/"
  });
}

// ✅ Export the database (Realtime Database or Firestore)
export const db = admin.database();
// If using Firestore instead → export const db = admin.firestore();

export default app;