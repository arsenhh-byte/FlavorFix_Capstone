import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { data: session } = useSession();
  const { cartItems, clearCart } = useCart();
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  // Example "Place Order" function
  const handlePlaceOrder = async () => {
    if (!session) {
      setError("Please log in to place an order.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setError("");
    console.log("[Cart] Placing order with items:", cartItems);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          location: location || "", // optional
        }),
      });
      const data = await response.json();
      console.log("[Cart] POST /api/orders response:", data);

      if (data.success) {
        alert("Order created successfully!");
        // Optionally clear the cart or redirect
        clearCart();
      } else {
        setError("Error: " + data.message);
      }
    } catch (err) {
      console.error("[Cart] Error placing order:", err);
      setError("Failed to place order. See console for details.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Cart</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item.recipe_id}>
                {item.recipeTitle} x {item.quantity}
              </li>
            ))}
          </ul>
          <div style={{ margin: "10px 0" }}>
            <label>Delivery Location: </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </>
      )}
    </div>
  );
}