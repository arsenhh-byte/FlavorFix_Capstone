// pages/api/orders.js
import dbConnect from "../../backend/config/db";
import Order from "../../backend/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]"; // Adjust path if needed

export default async function handler(req, res) {
  await dbConnect();

  // Ensure the user is authenticated via NextAuth
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  const email = session.user.email;

  switch (req.method) {
    // POST: Customer places an order
    case "POST": {
      const { cartItems, location } = req.body;
      if (!cartItems || !location) {
        return res.status(400).json({ success: false, message: "Missing cart items or location" });
      }
      try {
        const newOrder = await Order.create({
          userEmail: email,
          cartItems,
          location,
          status: "pending",
        });
        return res.status(200).json({ success: true, order: newOrder });
      } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
    // GET: Fetch orders based on user role
    case "GET": {
      try {
        // For chefs: show orders that are pending/accepted/cooking or assigned to them.
        // For delivery: show orders that are ready or delivering, or assigned to them.
        // For regular customers: show orders that belong to them.
        const isChef = session.user.isChef;
        const isDelivery = session.user.isDelivery;

        let orders;
        if (isChef) {
          orders = await Order.find({
            $or: [
              { status: { $in: ["pending", "accepted", "cooking"] } },
              { chefEmail: email }
            ]
          });
        } else if (isDelivery) {
          orders = await Order.find({
            $or: [
              { status: { $in: ["ready", "delivering"] } },
              { deliveryEmail: email }
            ]
          });
        } else {
          orders = await Order.find({ userEmail: email });
        }
        return res.status(200).json({ success: true, orders });
      } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
    // PUT: Update order status (chef or delivery updating)
    case "PUT": {
      const { orderId, status } = req.body;
      if (!orderId || !status) {
        return res.status(400).json({ success: false, message: "Missing orderId or status" });
      }
      try {
        let updateFields = { status };
        // If chef is updating (accept, cooking, ready)
        if (["accepted", "cooking", "ready"].includes(status)) {
          updateFields.chefEmail = email;
        }
        // If delivery is updating (delivering, completed)
        if (["delivering", "completed"].includes(status)) {
          updateFields.deliveryEmail = email;
        }
        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true });
        if (!updatedOrder) {
          return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.status(200).json({ success: true, order: updatedOrder });
      } catch (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
    default:
      return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}