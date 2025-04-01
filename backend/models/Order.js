// backend/models/Order.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  recipe_id: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  chefEmail: { type: String, default: "" },
  deliveryAddress: { type: String, default: "" },
  quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  cartItems: { type: [cartItemSchema], required: true },
  // Location here is intended as the overall delivery address (if not provided on each cart item)
  location: { type: String, default: "" },
  chefEmail: { type: String, default: null },
  deliveryEmail: { type: String, default: null },
  specialInstructions: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "accepted", "cooking", "ready", "delivering", "completed", "cancelled"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);