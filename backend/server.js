const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { db } = require("./firebase.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ===== Reports API =====
app.post("/api/reports", async (req, res) => {
  try {
    const { location, dangerLevel } = req.body;
    const docRef = await db.collection("reports").add({ location, dangerLevel });
    res.status(200).json({ message: "Report added", id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    const snapshot = await db.collection("reports").get();
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ===== SOS API =====
app.post("/api/sos", (req, res) => {
  const { userId, location } = req.body;
  console.log(`🚨 SOS from ${userId} at ${JSON.stringify(location)}`);
  res.status(200).json({ message: "SOS received" });
});

// ===== Spots API =====
app.get("/api/spots", async (req, res) => {
  try {
    const snapshot = await db.collection("spots").get();
    const spots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(spots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Test route
app.get("/", (req, res) => res.send("SafePath Backend Running 🚀"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
