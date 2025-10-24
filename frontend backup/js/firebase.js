// ✅ Import Firebase modules from CDN (for browser use)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.15.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.15.0/firebase-database.js";

// ✅ Your Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyD__dtg2e10sUZygT1i_gRpvLXpwgV-uRg",
  authDomain: "safe-path-mnm.firebaseapp.com",
  databaseURL: "https://safe-path-mnm-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "safe-path-mnm",
  storageBucket: "safe-path-mnm.firebasestorage.app",
  messagingSenderId: "159592505825",
  appId: "1:159592505825:web:3930c17cdfc0dfaa9f72a0"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ✅ Export database for use in other files
export { database };
