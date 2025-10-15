// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD__dtg2e10sUZygT1i_gRpvLXpwgV-uRg",
  authDomain: "safe-path-mnm.firebaseapp.com",
  projectId: "safe-path-mnm",
  storageBucket: "safe-path-mnm.firebasestorage.app",
  messagingSenderId: "159592505825",
  appId: "1:159592505825:web:3930c17cdfc0dfaa9f72a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-app.firebaseio.com"
});

export const db = admin.database(); // or admin.firestore()
