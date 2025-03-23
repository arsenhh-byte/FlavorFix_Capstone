// pages/choose-chef.js
import React, { useRef } from "react";
import styles from "../styles/chooseChef.module.css";

const dummyChefs = [
  {
    name: "Chef Gordon",
    rating: 4.9,
    cuisine: "British & French Cuisine",
    experience: "15 years",
    description: "Specializes in fine dining and fusion recipes.",
    image: "/gordon.jpg"
  },
  {
    name: "Chef Jamie",
    rating: 4.7,
    cuisine: "Italian & British Cuisine",
    experience: "10 years",
    description: "Known for quick, simple, and healthy meals.",
    image: "/jamie.jpg"
  },
  {
    name: "Chef Nigella",
    rating: 4.8,
    cuisine: "Baking & Comfort Foods",
    experience: "12 years",
    description: "Expert in desserts and indulgent home cooking.",
    image: "/nigella.jpg"
  },
  {
    name: "Chef Aiko",
    rating: 4.5,
    cuisine: "Japanese & Fusion Cuisine",
    experience: "8 years",
    description: "Creates unique sushi and ramen fusion dishes.",
    image: "/aiko.jpg"
  },
  {
    name: "Chef Mateo",
    rating: 4.6,
    cuisine: "Spanish & Mediterranean Cuisine",
    experience: "9 years",
    description: "Paella and tapas specialist with farm-to-table approach.",
    image: "/mateo.jpg"
  },
  {
    name: "Chef Priya",
    rating: 4.8,
    cuisine: "Indian Cuisine",
    experience: "11 years",
    description: "Known for aromatic curries and authentic spice blends.",
    image: "/priya.jpg"
  }
];

export default function ChooseChefPage() {
  const carouselRef = useRef(null);

  // Scroll left/right by a fixed amount (tweak 240 if needed)
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

  const handleSelectChef = (chef) => {
    alert(`You chose ${chef.name}! We'll notify them to start cooking.`);
    // Optionally, call an API endpoint to update an order with the chosen chef
  };

  return (
    <div className={styles.chooseChefContainer}>
      <h1>Choose a Chef</h1>
      <p>Please select a chef to prepare your requested meal:</p>

      <div className={styles.carouselOuter}>
        <button className={styles.arrowButton} onClick={scrollLeft}>
          ◀
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
          ▶
        </button>
      </div>
    </div>
  );
}