import { db } from "./backend/firebase.js";

db.ref("test").set({ working: true })
  .then(() => {
    console.log("✅ Data written successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error writing data:", error);
    process.exit(1);
  });
