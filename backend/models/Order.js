// backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },       // Customer’s email
  cartItems: [
    {
      recipe_id: String,
      recipeTitle: String,
      quantity: Number,
      price: Number
    }
  ],
  location: { type: String, default: "" },           // Delivery address (or lat/long)
  chefEmail: { type: String, default: null },          // Assigned chef’s email
  deliveryEmail: { type: String, default: null },      // Assigned delivery person’s email
  status: { 
    type: String, 
    enum: ["pending", "accepted", "cooking", "ready", "delivering", "completed", "cancelled"],
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);