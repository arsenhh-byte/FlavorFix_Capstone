// pages/api/orders.js
import dbConnect from "../../backend/config/db";
import Order from "../../backend/models/Order";
import User from "../../backend/models/User"; // Import User for fallback lookup
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]"; // Adjust path if needed

export default async function handler(req, res) {
  await dbConnect();

  // Retrieve the session using NextAuth
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  // Fallback lookup: if session.user.isChef is undefined, look up from DB
  if (typeof session.user.isChef === "undefined") {
    try {
      const userFromDb = await User.findOne({ email: session.user.email });
      session.user.isChef = userFromDb?.isChef || false;
      console.log("[orders.js] Fallback: user.isChef set to", session.user.isChef);
    } catch (error) {
      console.error("[orders.js] Error during fallback lookup:", error);
      session.user.isChef = false;
    }
  }
  
  const email = session.user.email;
  console.log("[orders.js] Logged-in user:", email, "isChef:", session.user.isChef);

  switch (req.method) {
    // POST: Create an order
    case "POST": {
      const { cartItems, location, specialInstructions } = req.body;
      console.log("[orders.js] POST start. cartItems:", cartItems);
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: "Missing cart items" });
      }
      try {
        // Optionally assign chefEmail from the first cart item if available
        const assignedChefEmail = cartItems[0]?.chefEmail || null;
        const newOrder = await Order.create({
          userEmail: email,
          cartItems,
          location: location || "",
          status: "pending",
          chefEmail: assignedChefEmail,
          specialInstructions: specialInstructions || "",
        });
        console.log("[orders.js] Created order:", newOrder._id, "chefEmail:", newOrder.chefEmail);
        return res.status(200).json({ success: true, order: newOrder });
      } catch (error) {
        console.error("[orders.js] Error creating order:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }

    // GET: Fetch orders based on user role
    case "GET": {
      try {
        const isChef = session.user.isChef;
        console.log("[orders.js] isChef:", isChef);
        let orders;
        if (isChef) {
          // For chefs: show orders that are either pending, accepted, or cooking OR assigned to them.
          orders = await Order.find({
            $or: [
              { status: { $in: ["pending", "accepted", "cooking"] } },
              { chefEmail: email }
            ]
          }).sort({ createdAt: -1 });
        } else {
          // For regular users: show orders that belong to them.
          orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
        }
        console.log("[orders.js] Found orders:", orders.length);
        return res.status(200).json({ success: true, orders });
      } catch (error) {
        console.error("[orders.js] Error fetching orders:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }

    // PUT: Update order status
    case "PUT": {
      const { orderId, status } = req.body;
      if (!orderId || !status) {
        return res.status(400).json({ success: false, message: "Missing orderId or status" });
      }
      try {
        const updateFields = { status };
        // If a chef updates the order (accepted, cooking, ready)
        if (["accepted", "cooking", "ready"].includes(status)) {
          updateFields.chefEmail = email;
        }
        // If a delivery person updates the order (delivering, completed, cancelled)
        if (["delivering", "completed", "cancelled"].includes(status)) {
          updateFields.deliveryEmail = email;
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