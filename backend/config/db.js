// backend/db.js
const mongoose = require('mongoose');

// Create a function that initiates the DB connection
async function connectDb() {
  // If already connected, return
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // Otherwise, connect
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Successfully connected to MongoDB!");
}

// Export the function
module.exports = connectDb;
