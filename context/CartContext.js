// context/CartContext.js
import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (recipe) => {
    setCartItems((prev) => [...prev, recipe]);
  };

  const removeFromCart = (recipeId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== recipeId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}