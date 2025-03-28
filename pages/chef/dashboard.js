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

      // Log the session data for debugging
      console.log("[ChefDashboard] session:", session);

      try {
        const res = await fetch("/api/orders", { method: "GET", cache: "no-store" });
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

    // Only fetch if user is a chef
    if (status === "authenticated" && session.user.isChef) {
      fetchChefOrders();
    }
  }, [session, status]);

  // Debug: see if user is recognized as a chef
  if (status === "loading") {
    return <p className={styles.errorMessage}>Loading session...</p>;
  }
  if (!session) {
    return <p className={styles.errorMessage}>Please log in as a chef.</p>;
  }
  if (!session.user.isChef) {
    return <p className={styles.errorMessage}>You are not authorized to view this page.</p>;
  }

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
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
      prev.map((order) => {
        if (order._id === orderId) {
          return { ...order, showInstructions: !order.showInstructions };
        }
        return order;
      })
    );
  };

  return (
    <div className={styles.chefDashboardBg}>
      <div className={styles.dashboardContainer}>
        <h1 className={styles.dashboardTitle}>Chef Dashboard</h1>
        <p className={styles.subtitle}>Manage Pending and Cooking Orders</p>
          console.log("[ChefDashboard] session from useSession:", session);


        {error && <p className={styles.errorMessage}>{error}</p>}

        {orders.length === 0 ? (
          <p className={styles.noOrdersText}>No pending orders at the moment.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              {/* Order Top Section */}
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.orderId}>Order: {order._id}</span>
                  <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Recipe Info Section */}
              <div className={styles.recipeSection}>
                {order.recipeImage && (
                  <img
                    src={order.recipeImage}
                    alt="Recipe"
                    className={styles.recipeImage}
                  />
                )}
                <div className={styles.recipeInfo}>
                  <h2 className={styles.recipeTitle}>
                    {order.recipeTitle || "No Recipe Title"}
                  </h2>
                  <p className={styles.deliveryAddress}>
                    <strong>Delivery Address:</strong>{" "}
                    {order.location || "Not Provided"}
                  </p>
                </div>
              </div>

              {/* Instructions Section (Collapsible) */}
              <div className={styles.instructionsContainer}>
                <button
                  className={styles.instructionsToggle}
                  onClick={() => toggleInstructions(order._id)}
                >
                  {order.showInstructions ? "Hide Instructions" : "Show Instructions"}
                </button>
                {order.showInstructions && order.instructions && (
                  <div className={styles.instructionsContent}>
                    <h3>Cooking Instructions</h3>
                    <p>{order.instructions}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={styles.buttonRow}>
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}