// pages/customer_order_status.js
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "../styles/orders.module.css";

export default function CustomerOrderStatus() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
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
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [session, status]);

  if (status === "loading") {
    return <p>Loading orders...</p>;
  }
  if (!session) {
    return <p>Please log in to view your orders.</p>;
  }

  return (
    <div className={styles.ordersContainer}>
      <h1 className={styles.pageTitle}>My Order Status</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <span className={styles.orderId}>Order #{order._id}</span>
              <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className={styles.orderDetails}>
              <p><strong>Delivery Address:</strong> {order.location}</p>
              {order.cartItems?.length > 0 && (
                <div>
                  <p><strong>Items:</strong></p>
                  {order.cartItems.map((item, i) => (
                    <p key={i} className={styles.cartItem}>
                      {item.recipeTitle} (x{item.quantity})
                    </p>
                  ))}
                </div>
              )}
            </div>
            <button className={styles.button}>View Details</button>
          </div>
        ))
      )}
    </div>
  );
}