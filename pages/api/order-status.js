// pages/api/order-status.js
import dbConnect from "../../backend/config/db";
import Order from "../../backend/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const { orderId } = req.query;
  if (!orderId) {
    return res.status(400).json({ message: "Missing orderId" });
  }
  
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Ensure only the owner sees the order status
    if (order.userEmail !== session.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.status(200).json({
      status: order.status,
      chefMessage: order.chefMessage || "",
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    return res.status(500).json({ message: "Server error" });
  }
}