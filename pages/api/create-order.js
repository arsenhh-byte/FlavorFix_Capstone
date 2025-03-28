// pages/api/create-order.js
import dbConnect from "../../backend/config/db";
import Order from "../../backend/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const { cartItems, location } = req.body;
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }
  
  try {
    // Create an order with status "pending"
    const order = await Order.create({
      userEmail: session.user.email,
      cartItems,
      location: location || "",
      status: "pending", // initial status
    });
    return res.status(200).json({ orderId: order._id, status: order.status });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Server error" });
  }
}