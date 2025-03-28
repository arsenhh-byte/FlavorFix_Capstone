// components/CartModal.jsx
import React from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/router";
import styles from "../styles/cartModal.module.css";

const CartModal = ({ onClose }) => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    // Optionally clear the modal and navigate to the full cart page
    onClose();
    router.push("/cart");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
        <h2 className={styles.title}>Your Cart</h2>
        {cartItems.length === 0 ? (
          <p className={styles.emptyText}>No items in your cart.</p>
        ) : (
          <ul className={styles.itemList}>
            {cartItems.map((item) => (
              <li key={item.id} className={styles.item}>
                <img src={item.image} alt={item.title} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  {item.chef && (
                    <p className={styles.itemChef}>
                      <em>Chef: {item.chef.name}</em>
                    </p>
                  )}
                </div>
                <button onClick={() => removeFromCart(item.id)} className={styles.removeButton}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {cartItems.length > 0 && (
          <>
            <button onClick={clearCart} className={styles.clearButton}>Clear Cart</button>
            <button onClick={handleCheckout} className={styles.checkoutButton}>
              Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;