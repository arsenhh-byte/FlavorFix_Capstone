const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isChef: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  // Add a favorites array:
  favorites: [
    {
      recipe_id: { type: String, required: true },
      title: { type: String, required: true },
      image: { type: String } // not strictly required
      // You can add more fields if needed, e.g. ingredients, instructions, etc.
    }
  ]
});

// If a User model already exists, use it; otherwise create a new one
module.exports = mongoose.models.User || mongoose.model('User', userSchema);