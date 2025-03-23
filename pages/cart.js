// pages/cart.js
import React from "react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>No items in your cart.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id} style={{ marginBottom: 10 }}>
              <strong>{item.title}</strong>
              <img
                src={item.image}
                alt={item.title}
                style={{ width: 100, borderRadius: 4, marginLeft: 10 }}
              />
              <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 10 }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}