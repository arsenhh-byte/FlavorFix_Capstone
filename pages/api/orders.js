// pages/api/orders.js
import dbConnect from "../../backend/config/db";
import Order from "../../backend/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  const email = session.user.email;
  console.log("[orders.js] Logged-in user:", email, "isChef:", session.user.isChef);

  switch (req.method) {
    // POST: create an order
    case "POST": {
      const { cartItems, location } = req.body;
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Missing cart items"
        });
      }
      try {
        const newOrder = await Order.create({
          userEmail: email,
          cartItems,
          location: location || "",
          status: "pending",
        });
        console.log("[orders.js] Created order:", newOrder._id);
        return res.status(200).json({ success: true, order: newOrder });
      } catch (error) {
        console.error("[orders.js] Error creating order:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
    // GET: fetch orders for either chef or regular user
    case "GET": {
      try {
        const isChef = session.user.isChef;
        const isDelivery = session.user.isDelivery;
        console.log("[orders.js] isChef:", isChef, "isDelivery:", isDelivery);

        let orders;
        if (isChef) {
          // Chef sees orders with status in [pending, accepted, cooking]
          // or orders assigned to them
          orders = await Order.find({
            $or: [
              { status: { $in: ["pending", "accepted", "cooking"] } },
              { chefEmail: email }
            ]
          }).sort({ createdAt: -1 });
        } else if (isDelivery) {
          // Delivery sees orders with status in [ready, delivering] or assigned to them
          orders = await Order.find({
            $or: [
              { status: { $in: ["ready", "delivering"] } },
              { deliveryEmail: email }
            ]
          }).sort({ createdAt: -1 });
        } else {
          // Regular user sees their own orders
          orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
        }
        console.log("[orders.js] Found orders:", orders.length);
        return res.status(200).json({ success: true, orders });
      } catch (error) {
        console.error("[orders.js] Error fetching orders:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
    // PUT: update order status
    case "PUT": {
      const { orderId, status, chefMessage } = req.body;
      if (!orderId || !status) {
        return res.status(400).json({ success: false, message: "Missing orderId or status" });
      }
      try {
        let updateFields = { status };
        // If a chef is updating the order
        if (["accepted", "cooking", "ready"].includes(status)) {
          updateFields.chefEmail = email;
        }
        // If a delivery person is updating
        if (["delivering", "completed"].includes(status)) {
          updateFields.deliveryEmail = email;
        }
        // If there's a chefMessage provided
        if (chefMessage) {
          updateFields.chefMessage = chefMessage;
        }
        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true });
        if (!updatedOrder) {
          return res.status(404).json({ success: false, message: "Order not found" });
        }
        console.log("[orders.js] Updated order:", updatedOrder._id, "to status:", status);
        return res.status(200).json({ success: true, order: updatedOrder });
      } catch (error) {
        console.error("[orders.js] Error updating order:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
    default:
      return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}