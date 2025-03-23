// pages/api/test.js
const connectDb = require('../../backend/config/db'); // Adjust path if needed

export default async function handler(req, res) {
  try {
    await connectDb(); // Calls your exported function
    res.status(200).json({ success: true, message: 'Database connected successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
