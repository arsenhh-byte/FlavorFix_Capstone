// pages/cart.js
import React from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/router";
import styles from "../styles/cart.module.css";

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, incrementQuantity, decrementQuantity } = useCart();
  const router = useRouter();

  // Calculate total items in the cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Checkout function—this is a placeholder for your real checkout integration.
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items first.");
      return;
    }
    // You could, for example, combine the delivery address from each item here or assume they’re the same.
    alert("Order placed! Thank you for your purchase.");
    clearCart();
    router.push("/");
  };

  return (
    <div className={styles.cartContainer}>
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className={styles.emptyMessage}>Your cart is empty.</p>
      ) : (
        <>
          <ul className={styles.cartList}>
            {cartItems.map((item) => (
              <li key={item.id} className={styles.cartItem}>
                <img src={item.image} alt={item.title} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h3>{item.title}</h3>
                  {item.chef && <p><em>Chef: {item.chef.name}</em></p>}
                  {item.deliveryAddress && (
                    <p className={styles.deliveryAddress}>
                      Delivery Address: {item.deliveryAddress}
                    </p>
                  )}
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      className={styles.qtyButton}
                    >
                      –
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      className={styles.qtyButton}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className={styles.removeButton}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.cartFooter}>
            <p className={styles.totalItems}>
              Total Items: <strong>{totalItems}</strong>
            </p>
            <button onClick={clearCart} className={styles.clearButton}>
              Clear Cart
            </button>
            <button onClick={handleCheckout} className={styles.checkoutButton}>
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}