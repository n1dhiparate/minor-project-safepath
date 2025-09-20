import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgGKYzw8dxiPL-ajLBEZ-0uno9A4OHCCY",
  authDomain: "safepath-project-e5903.firebaseapp.com",
  projectId: "safepath-project-e5903",
  storageBucket: "safepath-project-e5903.appspot.com",
  messagingSenderId: "777627804331",
  appId: "1:777627804331:web:3a9381b20bb69628640dee",
  measurementId: "G-1ZETKHW6WD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs };
