const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Path to the JSON key
const serviceAccountPath = path.join(__dirname, "serviceaccountkey.json");

// Read the JSON file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db, admin };
