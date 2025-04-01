// pages/chef/dashboard.js
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "../../styles/chefDashboard.module.css";

export default function ChefDashboard() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChefOrders = async () => {
      if (!session) return;
      console.log("[ChefDashboard] Session:", session);
      try {
        const res = await fetch("/api/orders", {
          method: "GET",
          cache: "no-store",
        });
        const data = await res.json();
        console.log("[ChefDashboard] GET /api/orders response:", data);
        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error fetching orders");
        console.error("[ChefDashboard] Error fetching orders:", err);
      }
    };

    if (status === "authenticated" && session.user.isChef) {
      fetchChefOrders();
    }
  }, [session, status]);

  if (status === "loading") {
    return <p className={styles.errorMessage}>Loading session...</p>;
  }
  if (!session) {
    return <p className={styles.errorMessage}>Please log in as a chef.</p>;
  }
  if (!session.user.isChef) {
    return <p className={styles.errorMessage}>You are not authorized to view this page.</p>;
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      console.log("[ChefDashboard] PUT /api/orders response:", data);
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? data.order : order))
        );
      } else {
        console.error("Failed to update order:", data.message);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const toggleInstructions = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, showInstructions: !order.showInstructions } : order
      )
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Chef Dashboard</h1>
      <p className={styles.subtitle}>Manage Orders and View Special Instructions</p>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {orders.length === 0 ? (
        <p className={styles.noOrdersText}>No orders available at the moment.</p>
      ) : (
        orders.map((order) => {
          // Read the first cart item
          const firstItem = order.cartItems[0] || {};
          // Directly use the API fields—no fallback. If missing, nothing will show.
          const recipeTitle = firstItem.title;
          const recipeImage = firstItem.image;
          // For the delivery address, check the cart item's deliveryAddress first;
          // if missing, use the order-level location.
          const deliveryAddr = firstItem.deliveryAddress || order.location || "No Address Provided";

          console.log("[ChefDashboard] firstItem:", firstItem);

          return (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.cardHeader}>
                <span className={styles.orderId}>Order: {order._id}</span>
                <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className={styles.recipeSection}>
                {recipeImage ? (
                  <img src={recipeImage} alt={recipeTitle} className={styles.recipeImage} />
                ) : (
                  <p>No image available</p>
                )}
                <div className={styles.recipeInfo}>
                  <h2 className={styles.recipeTitle}>
                    {recipeTitle ? recipeTitle : "No Title"}
                  </h2>
                  <p className={styles.deliveryAddress}>
                    <strong>Delivery Address:</strong> {deliveryAddr}
                  </p>
                </div>
              </div>
              <div className={styles.instructionsContainer}>
                <button
                  className={styles.instructionsToggle}
                  onClick={() => toggleInstructions(order._id)}
                >
                  {order.showInstructions ? "Hide Instructions" : "Show Instructions"}
                </button>
                {order.showInstructions && (
                  <div className={styles.instructionsContent}>
                    <h3>Special Instructions</h3>
                    <p>
                      {order.specialInstructions && order.specialInstructions.trim() !== ""
                        ? order.specialInstructions
                        : "No special instructions provided."}
                    </p>
                  </div>
                )}
              </div>
              <div className={styles.buttonRow}>
                {order.status !== "cancelled" && order.status !== "completed" && (
                  <>
                    <button
                      className={styles.actionButton}
                      onClick={() => updateOrderStatus(order._id, "accepted")}
                    >
                      Accept Order
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => updateOrderStatus(order._id, "cooking")}
                    >
                      Mark as Cooking
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => updateOrderStatus(order._id, "ready")}
                    >
                      Mark as Ready
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={() => updateOrderStatus(order._id, "cancelled")}
                    >
                      Cancel Order
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}