// backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  cartItems: [
    {
      recipe_id: String,
      recipeTitle: String,
      quantity: Number,
      price: Number,
      chefEmail: String,       // if the user picks a specific chef
      deliveryAddress: String, // can be stored per item or at the order level
    }
  ],
  location: { type: String, default: "" },
  chefEmail: { type: String, default: null },
  deliveryEmail: { type: String, default: null },
  status: {
    type: String,
    enum: ["pending", "accepted", "cooking", "ready", "delivering", "completed", "cancelled"],
    default: "pending",
  },
  specialInstructions: { type: String, default: "" }, // <-- New field for user instructions
  chefMessage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);