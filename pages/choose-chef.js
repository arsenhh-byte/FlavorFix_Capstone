// pages/choose-chef.js
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useCart } from "../context/CartContext";
import styles from "../styles/chooseChef.module.css";

const dummyChefs = [
  {
    name: "Chef Gordon",
    rating: 4.9,
    cuisine: "British & French Cuisine",
    experience: "15 years",
    description: "Specializes in fine dining and fusion recipes.",
    image: "/gordon.jpg",
    email: "gordon@gmail.com" // must match a user in DB if you want
  },
  {
    name: "Chef Jamie",
    rating: 4.7,
    cuisine: "Italian & British Cuisine",
    experience: "10 years",
    description: "Known for quick, simple, and healthy meals.",
    image: "/jamie.jpg",
    email: "jamie@gmail.com"  // MUST match your jamie in DB
  },
  {
    name: "Chef Nigella",
    rating: 4.8,
    cuisine: "Baking & Comfort Foods",
    experience: "12 years",
    description: "Expert in desserts and indulgent home cooking.",
    image: "/nigella.jpg",
    email: "nigella@gmail.com"
  },
  {
    name: "Chef Aiko",
    rating: 4.5,
    cuisine: "Japanese & Fusion Cuisine",
    experience: "8 years",
    description: "Creates unique sushi and ramen fusion dishes.",
    image: "/aiko.jpg",
    email: "aiko@gmail.com"
  },
  {
    name: "Chef Mateo",
    rating: 4.6,
    cuisine: "Spanish & Mediterranean Cuisine",
    experience: "9 years",
    description: "Paella and tapas specialist with farm-to-table approach.",
    image: "/mateo.jpg",
    email: "mateo@gmail.com"
  },
  {
    name: "Chef Priya",
    rating: 4.8,
    cuisine: "Indian Cuisine",
    experience: "11 years",
    description: "Known for aromatic curries and authentic spice blends.",
    image: "/priya.jpg",
    email: "priya@gmail.com"
  },
];

export default function ChooseChefPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [pendingRecipe, setPendingRecipe] = useState(null);
  const carouselRef = useRef(null);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  useEffect(() => {
    const stored = localStorage.getItem("pendingRecipe");
    if (stored) {
      setPendingRecipe(JSON.parse(stored));
    }
  }, []);

  const handleLocationSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      console.log("Selected coordinates:", { lat, lng });
    } catch (error) {
      console.error("Error fetching geocode:", error);
    }
  };

  // Attach chef email to the cart item
  const handleSelectChef = (chef) => {
    if (!pendingRecipe) {
      alert("No pending recipe found!");
      return;
    }
    if (!value.trim()) {
      alert("Please enter your delivery address before selecting a chef.");
      return;
    }
    // store the chosen chef’s email
    const cartItem = {
      ...pendingRecipe,
      chefEmail: chef.email,  // crucial to assign the chef's email
      deliveryAddress: value,
    };
    addToCart(cartItem);
    localStorage.removeItem("pendingRecipe");
    router.push("/cart");
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 240;
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 240;
    }
  };

  return (
    <motion.div
      className={styles.chooseChefContainer}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Choose a Chef</h1>
      <p>Please select a chef for your meal and enter your delivery location below:</p>
      
      <div className={styles.locationWrapper}>
        <input
          id="location"
          type="text"
          placeholder="Enter your location..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={styles.locationInput}
          disabled={!ready}
        />
        {status === "OK" && (
          <div className={styles.suggestionsContainer}>
            {data.map((suggestion, idx) => {
              const style = {
                backgroundColor: suggestion.active ? "#f0f0f0" : "#fff",
                padding: "5px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              };
              return (
                <div
                  key={idx}
                  style={style}
                  onClick={() => handleLocationSelect(suggestion.description)}
                >
                  {suggestion.description}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.carouselOuter}>
        <button className={styles.arrowButton} onClick={scrollLeft}>
          ◀️
        </button>
        <div className={styles.chefsCarousel} ref={carouselRef}>
          {dummyChefs.map((chef, index) => (
            <div key={index} className={styles.chefCard}>
              <img src={chef.image} alt={chef.name} className={styles.chefImage} />
              <h2 className={styles.chefName}>{chef.name}</h2>
              <p><strong>Rating:</strong> {chef.rating}</p>
              <p><strong>Cuisine:</strong> {chef.cuisine}</p>
              <p><strong>Experience:</strong> {chef.experience}</p>
              <p className={styles.chefDesc}>{chef.description}</p>
              <button
                className={styles.selectChefButton}
                onClick={() => handleSelectChef(chef)}
              >
                Select Chef
              </button>
            </div>
          ))}
        </div>
        <button className={styles.arrowButton} onClick={scrollRight}>
          ▶️
        </button>
      </div>
    </motion.div>
  );
}