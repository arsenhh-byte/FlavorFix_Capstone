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
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
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
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Chef Dashboard</h1>
      <p className={styles.subtitle}>Manage Orders and View Special Instructions</p>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {orders.length === 0 ? (
        <p className={styles.noOrdersText}>No orders available at the moment.</p>
      ) : (
        orders.map((order) => {
          // Grab the first cart item
          const firstItem = order.cartItems[0] || {};
          console.log("[ChefDashboard] firstItem:", firstItem);

          // Fallback logic for recipe title & image
          const recipeTitle =
            firstItem.title ||
            firstItem.recipeTitle ||
            "No Recipe Title";
          const recipeImage =
            firstItem.image ||
            firstItem.recipeImage ||
            "/placeholder.jpg";

          return (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.orderId}>Order: {order._id}</span>
                  <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className={styles.recipeSection}>
                <img
                  src={recipeImage}
                  alt={recipeTitle}
                  className={styles.recipeImage}
                />
                <div className={styles.recipeInfo}>
                  <h2 className={styles.recipeTitle}>{recipeTitle}</h2>
                  <p className={styles.deliveryAddress}>
                    <strong>Delivery Address:</strong>{" "}
                    {order.location || "User's address not provided"}
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
                    <h3>Special Instructions from User</h3>
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