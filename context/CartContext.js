// context/CartContext.js
import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // If item is new, add it with quantity=1. If it already exists, increment quantity.
  const addToCart = (recipe) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === recipe.id);
      if (existing) {
        return prev.map((item) =>
          item.id === recipe.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...recipe, quantity: 1 }];
      }
    });
  };

  // Remove an entire item from the cart
  const removeFromCart = (recipeId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== recipeId));
  };

  // Clear all items from the cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Increment item quantity by 1
  const incrementQuantity = (recipeId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === recipeId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrement item quantity by 1, remove if quantity goes below 1
  const decrementQuantity = (recipeId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === recipeId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        incrementQuantity,
        decrementQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}