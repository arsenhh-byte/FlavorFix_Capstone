import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useCart } from "../context/CartContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "../styles/chooseChef.module.css";

const dummyChefs = [
  { name: "Chef Gordon",  rating: 4.9, cuisine: "British & French", experience: "15 yrs", description: "Fine dining & fusion.", image: "/gordon.jpg",  email: "gordon@gmail.com" },
  { name: "Chef Jamie",   rating: 4.7, cuisine: "Italian & British", experience: "10 yrs", description: "Quick, healthy meals.", image: "/jamie.jpg",   email: "jamie@gmail.com" },
  { name: "Chef Nigella",  rating: 4.8, cuisine: "Baking & Comfort", experience: "12 yrs", description: "Desserts & comfort food.", image: "/nigella.jpg", email: "nigella@gmail.com" },
  { name: "Chef Aiko",     rating: 4.5, cuisine: "Japanese & Fusion", experience: "8 yrs",  description: "Sushi & ramen fusion.", image: "/aiko.jpg",    email: "aiko@gmail.com" },
  { name: "Chef Mateo",    rating: 4.6, cuisine: "Spanish & Med", experience: "9 yrs",  description: "Paella & tapas.", image: "/mateo.jpg",    email: "mateo@gmail.com" },
  { name: "Chef Priya",    rating: 4.8, cuisine: "Indian", experience: "11 yrs", description: "Aromatic curries.", image: "/priya.jpg",    email: "priya@gmail.com" },
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
    if (stored) setPendingRecipe(JSON.parse(stored));
  }, []);

  const handleLocationSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      console.log("Coordinates:", { lat, lng });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChef = (chef) => {
    if (!pendingRecipe) return alert("No pending recipe!");
    if (!value.trim())   return alert("Enter delivery address!");
    addToCart({
      ...pendingRecipe,
      chefEmail: chef.email,
      deliveryAddress: value,
      title: pendingRecipe.title,
      image: pendingRecipe.image,
    });
    localStorage.removeItem("pendingRecipe");
    router.push("/cart");
  };

  const scrollLeft  = () => carouselRef.current?.scrollBy({ left: -240, behavior: "smooth" });
  const scrollRight = () => carouselRef.current?.scrollBy({ left:  240, behavior: "smooth" });

  return (
    <motion.div
      className={styles.chooseChefContainer}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Choose a Chef</h1>
      <p>Select a chef and enter your delivery location:</p>

      <div className={styles.locationWrapper}>
        <input
          type="text"
          placeholder="Enter your location..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          className={styles.locationInput}
        />
        {status === "OK" && (
          <div className={styles.suggestionsContainer}>
            {data.map((s, i) => (
              <div
                key={i}
                className={styles.suggestion}
                onClick={() => handleLocationSelect(s.description)}
              >
                {s.description}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.carouselOuter}>
        <button className={`${styles.arrowButton} ${styles.left}`} onClick={scrollLeft}>
          <FaChevronLeft />
        </button>

        <div className={styles.chefsCarousel} ref={carouselRef}>
          {dummyChefs.map((chef, idx) => (
            <div key={idx} className={styles.chefCard}>
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

        <button className={`${styles.arrowButton} ${styles.right}`} onClick={scrollRight}>
          <FaChevronRight />
        </button>
      </div>
    </motion.div>
  );
}