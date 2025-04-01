// pages/api/orders.js
import dbConnect from "../../backend/config/db";
import Order from "../../backend/models/Order";
import User from "../../backend/models/User"; // For fallback lookup if needed
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  // Fallback lookup: if session.user.isChef is undefined, retrieve it from the DB.
  if (typeof session.user.isChef === "undefined") {
    try {
      const userFromDb = await User.findOne({ email: session.user.email });
      session.user.isChef = userFromDb?.isChef || false;
      console.log("[orders.js] Fallback: user.isChef set to", session.user.isChef);
    } catch (error) {
      console.error("[orders.js] Fallback lookup error:", error);
      session.user.isChef = false;
    }
  }

  const email = session.user.email;
  console.log("[orders.js] Logged-in user:", email, "isChef:", session.user.isChef);

  switch (req.method) {
    case "POST": {
      const { cartItems, location, specialInstructions } = req.body;
      console.log("[orders.js] POST start. Received cartItems:", cartItems);
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: "Missing cart items" });
      }

      // Fallback: Ensure each cart item has a valid recipe_id.
      const fixedCartItems = cartItems.map((item, idx) => {
        if (!item.recipe_id && item.id) {
          console.log(
            `[orders.js] Fixing cart item at index ${idx}: setting recipe_id from item.id`
          );
          return { ...item, recipe_id: item.id.toString() };
        }
        return item;
      });

      console.log("[orders.js] Final cartItems to store:", fixedCartItems);

      try {
        const assignedChefEmail = fixedCartItems[0]?.chefEmail || null;
        const newOrder = await Order.create({
          userEmail: email,
          cartItems: fixedCartItems,
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
    case "GET": {
      try {
        const isChef = session.user.isChef;
        console.log("[orders.js] isChef:", isChef);
        let orders;
        if (isChef) {
          orders = await Order.find({
            $or: [
              { status: { $in: ["pending", "accepted", "cooking"] } },
              { chefEmail: email }
            ]
          }).sort({ createdAt: -1 });
        } else {
          orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
        }
        console.log("[orders.js] Found orders:", orders.length);
        return res.status(200).json({ success: true, orders });
      } catch (error) {
        console.error("[orders.js] GET error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
    case "PUT": {
      const { orderId, status } = req.body;
      if (!orderId || !status) {
        return res.status(400).json({ success: false, message: "Missing orderId or status" });
      }
      try {
        const updateFields = { status };
        if (["accepted", "cooking", "ready"].includes(status)) {
          updateFields.chefEmail = email;
        }
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
        console.error("[orders.js] PUT error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
    default:
      return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}