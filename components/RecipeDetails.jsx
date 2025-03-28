// components/RecipeDetails.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { PiCookingPotFill } from "react-icons/pi";
import { FaClock, FaListOl } from "react-icons/fa";
import { GiChefToque } from "react-icons/gi"; // Chef icon from react-icons
import { useAuth } from "../AuthContext"; // or useSession from next-auth/react
import styles from "../styles/details.module.css";

const RecipeDetails = ({ recipe, onClose }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { image, title, readyInMinutes, instructions, extendedIngredients, id } = recipe;

  const [isFavorited, setIsFavorited] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [message, setMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  // Check if the recipe is already favorited when component mounts or user changes
  useEffect(() => {
    if (user && user.favorites) {
      const alreadyFav = user.favorites.some((fav) => fav.recipe_id === id);
      setIsFavorited(alreadyFav);
    } else {
      setIsFavorited(false);
    }
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) {
      setMessage("Please log in to favorite a recipe.");
      return;
    }
    try {
      if (!isFavorited) {
        // Call the API to add favorite
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipe_id: id,
            title,
            image,
          }),
        });
        if (response.ok) {
          setIsFavorited(true);
          setMessage("Recipe favorited successfully!");
        } else {
          setMessage("Failed to add favorite.");
        }
      } else {
        // Call the API to remove favorite
        const response = await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe_id: id }),
        });
        if (response.ok) {
          setIsFavorited(false);
          setMessage("Favorite removed successfully!");
        } else {
          setMessage("Failed to remove favorite.");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setMessage("An error occurred.");
    }
  };

  const handleRequestChef = async () => {
    if (!user) {
      alert("Please log in to request a chef");
      return;
    }
    try {
      localStorage.setItem("pendingRecipe", JSON.stringify(recipe));
      router.push("/choose-chef");
    } catch (error) {
      console.error("Error requesting chef:", error);
      setOrderMessage("Error requesting chef");
    }
  };

  const toggleInstructions = () => setShowInstructions((prev) => !prev);
  const toggleIngredients = () => setShowIngredients((prev) => !prev);

  return (
    <div className={styles.recipeDetails}>
      {/* Top Buttons */}
      <button onClick={onClose} className={styles.closeButton}>X</button>
      <button
        onClick={toggleFavorite}
        className={`${styles.heartButton} ${isFavorited ? styles.favorited : ""}`}
      >
        <FontAwesomeIcon icon={faHeart} style={{ color: isFavorited ? "red" : "grey" }} />
      </button>
      {message && <p className={styles.message}>{message}</p>}
      
      <h2 className={styles.recipeTitle}>{title}</h2>
      <img src={image} alt={title} className={styles.recipeImage} />
      <div className={styles.recipeInfo}>
        <div className={styles.timeContainer}>
          <FaClock className={styles.timeButton} />
          <p>Ready in {readyInMinutes} minutes</p>
        </div>
      </div>

      {orderMessage && <p className={styles.orderMessage}>{orderMessage}</p>}

      {/* Request Chef Section */}
      <div className={styles.requestChefContainer}>
        <div className={styles.requestChefInner} onClick={handleRequestChef}>
          <GiChefToque className={styles.chefIcon} />
          <span className={styles.requestChefText}>Request Chef</span>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className={styles.ingredientsContainer}>
        <div className={styles.toggleContainer} onClick={toggleIngredients}>
          <FaListOl className={styles.toggleIcon} />
          <span>{showIngredients ? "Hide Ingredients" : "Show Ingredients"}</span>
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

      {/* Instructions Section */}
      <div className={styles.instructionsContainer}>
        <div className={styles.toggleContainer} onClick={toggleInstructions}>
          <PiCookingPotFill className={styles.toggleIcon} />
          <span>{showInstructions ? "Hide Instructions" : "Show Instructions"}</span>
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