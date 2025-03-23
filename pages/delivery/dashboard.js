// pages/delivery/dashboard.js
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function DeliveryDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeliveryOrders = async () => {
      if (!session) return;
      try {
        const res = await fetch("/api/orders", { method: "GET", cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error fetching orders");
        console.error(err);
      }
    };
    if (session && session.user.isDelivery) {
      fetchDeliveryOrders();
    }
  }, [session]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(order => order._id === orderId ? data.order : order));
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Delivery Dashboard</h1>
      <p>Ready/Delivering Orders:</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Recipe:</strong> {order.recipeTitle}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Delivery Address:</strong> {order.location}</p>
            <button onClick={() => updateOrderStatus(order._id, "delivering")}>Take Order</button>
            <button onClick={() => updateOrderStatus(order._id, "completed")}>Mark as Delivered</button>
          </div>
        ))
      )}
    </div>
  );
}