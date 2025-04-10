import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "../context/CartContext";
import styles from "../styles/cart.module.css";

export default function CartPage() {
  const { data: session, status } = useSession();
  const {
    cartItems,
    clearCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
  } = useCart();

  const [message, setMessage] = useState("");
  const [userInstructions, setUserInstructions] = useState("");
  const [order, setOrder] = useState(null);

  const handleCheckout = async () => {
    if (!cartItems.length) {
      alert("Your cart is empty. Please add items first.");
      return;
    }
    if (status !== "authenticated") {
      alert("Please log in first to place an order.");
      return;
    }
    console.log("[CartPage] Placing order for:", session.user.email);
    console.log("[CartPage] Cart items:", cartItems);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          location: "User's address",
          specialInstructions: userInstructions,
        }),
      });
      const data = await response.json();
      console.log("[CartPage] Order response:", data);
      if (data.success) {
        setOrder(data.order);
        setMessage(`Order placed! Order ID: ${data.order._id}`);
      } else {
        setMessage(`Order failed: ${data.message}`);
      }
    } catch (error) {
      console.error("[CartPage] Error placing order:", error);
      setMessage("Error placing order. See console for details.");
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id, status: "cancelled" }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Order cancelled.");
        setOrder(null);
        clearCart();
      } else {
        setMessage("Failed to cancel order: " + data.message);
      }
    } catch (error) {
      console.error("[CartPage] Error cancelling order:", error);
      setMessage("Error cancelling order. See console for details.");
    }
  };

  const handleRemoveItem = (index) => {
    removeFromCart(index);
    setMessage("Item removed from cart.");
  };

  return (
    <div className={styles.cartContainer}>
      <h1>Your Cart</h1>
      {cartItems.length === 0 && !order ? (
        <p className={styles.emptyMessage}>Your cart is empty.</p>
      ) : (
        <>
          <ul className={styles.cartList}>
            {cartItems.map((item, i) => (
              <li key={i} className={styles.cartItem}>
                <div className={styles.itemLeft}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title || item.recipeTitle}
                      className={styles.itemImage}
                    />
                  )}
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemTitle}>
                      {item.title || item.recipeTitle}
                    </h3>
                    <p>
                      <strong>Chef:</strong> {item.chefEmail || "Unassigned"}
                    </p>
                    <p>
                      <strong>Address:</strong> {item.deliveryAddress || "N/A"}
                    </p>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      className={styles.qtyButton}
                    >
                      -
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      className={styles.qtyButton}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(i)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.instructionsSection}>
            <label htmlFor="instructions" className={styles.instructionsLabel}>
              Special Instructions (e.g. allergies):
            </label>
            <textarea
              id="instructions"
              className={styles.instructionsInput}
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              placeholder="Enter any special instructions..."
            />
          </div>

          <div className={styles.cartFooter}>
            {order ? (
              <>
                <p className={styles.message}>
                  Order ID: {order._id} | Status: {order.status}
                </p>
                {order.status === "pending" && (
                  <button
                    onClick={handleCancelOrder}
                    className={styles.cancelButton}
                  >
                    Cancel Order
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleCheckout}
                  className={styles.checkoutButton}
                >
                  Checkout
                </button>
                <button onClick={clearCart} className={styles.clearCartButton}>
                  Clear Cart
                </button>
              </>
            )}
          </div>
        </>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
