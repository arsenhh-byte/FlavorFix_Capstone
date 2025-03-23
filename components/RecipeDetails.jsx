// components/RecipeDetails.jsx
import React, { useState, useEffect } from "react";
import styles from "../styles/details.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { PiCookingPotFill } from "react-icons/pi";
import { FaClock, FaListOl, FaUserTie } from "react-icons/fa";
import { useAuth } from "../AuthContext"; // or useSession from next-auth/react if applicable
import { useRouter } from "next/router";

const RecipeDetails = ({ recipe, onClose }) => {
  const router = useRouter();
  const { user } = useAuth(); // or useSession from next-auth/react
  const { image, title, readyInMinutes, instructions, extendedIngredients, id } = recipe;

  const [isFavorited, setIsFavorited] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [message, setMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  useEffect(() => {
    if (user && user.favorites) {
      const alreadyFav = user.favorites.some((fav) => fav.recipe_id === id);
      setIsFavorited(alreadyFav);
    } else {
      setIsFavorited(false);
    }
  }, [user, id]);

  const toggleFavorite = async () => {
    // your add/remove favorite logic
  };

  // When Request Chef is clicked, store the pending recipe and navigate to choose-chef page
  const handleRequestChef = async () => {
    if (!user) {
      alert("Please log in to request a chef");
      return;
    }
    try {
      // Optionally, you could create an order in your database here.
      // For now, we simply store the recipe in localStorage.
      localStorage.setItem("pendingRecipe", JSON.stringify(recipe));
      router.push("/choose-chef");
    } catch (error) {
      console.error("Error requesting chef:", error);
      setOrderMessage("Error requesting chef");
    }
  };

  const toggleInstructions = () => setShowInstructions(!showInstructions);
  const toggleIngredients = () => setShowIngredients(!showIngredients);

  return (
    <div>
      {/* Recipe Details Section */}
      <div className={styles.recipeDetails}>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
        <button onClick={toggleFavorite} className={styles.heartButton}>
          <FontAwesomeIcon
            icon={faHeart}
            style={{ color: isFavorited ? "red" : "grey" }}
          />
        </button>
        <p>{message}</p>
        <h2 className={styles.recipeTitle}>{title}</h2>
        <img src={image} alt={title} className={styles.recipeImage} />
        <div className={styles.recipeInfo}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <FaClock
              className={styles.timeButton}
              style={{ cursor: "pointer", fontSize: "30px", color: "black" }}
            />
            <p style={{ marginLeft: "10px" }}>
              Ready in {readyInMinutes} minutes
            </p>
          </div>
        </div>
      </div>

      <p style={{ color: "green" }}>{orderMessage}</p>

      {/* Request Chef Section (White container) */}
      <div className={styles.requestChefContainer}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaUserTie
            onClick={handleRequestChef}
            className={styles.ingreButton} // use the same teal icon style
            style={{ cursor: "pointer", fontSize: "30px", color: "black" }}
          />
          <span
            className={styles.requestChefText}
            style={{ marginLeft: "5px", cursor: "pointer" }}
            onClick={handleRequestChef}
          >
            Request Chef
          </span>
        </div>
      </div>

      {/* Show Ingredients Section */}
      <div className={styles.ingredientsContainer}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaListOl
            onClick={toggleIngredients}
            className={styles.ingreButton}
            style={{ cursor: "pointer", fontSize: "30px", color: "black" }}
          />
          <span
            style={{ marginLeft: "5px", cursor: "pointer" }}
            onClick={toggleIngredients}
          >
            {showIngredients ? "Hide Ingredients" : "Show Ingredients"}
          </span>
        </div>
        {showIngredients && (
          <div className={styles.ingredientsContent}>
            <ul className={styles.ingredientsList}>
              {extendedIngredients.map((ingredient, index) => (
                <li key={index} className={styles.ingredientItem}>
                  {ingredient.original}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Show Instructions Section */}
      <div className={styles.instructionsContainer}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <PiCookingPotFill
            onClick={toggleInstructions}
            className={styles.instrucButton}
            style={{ cursor: "pointer", fontSize: "30px", color: "black" }}
          />
          <span
            style={{ marginLeft: "5px", cursor: "pointer" }}
            onClick={toggleInstructions}
          >
            {showInstructions ? "Hide Instructions" : "Show Instructions"}
          </span>
        </div>
        {showInstructions && (
          <div className={styles.instructionsContent}>
            <div dangerouslySetInnerHTML={{ __html: instructions }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetails;