// components/FavoritesList.jsx
import React, { useState, useEffect } from "react";
import styles from "../styles/favorites.module.css";
import RecipeDetails from "./RecipeDetails";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const FavoritesList = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(2);
  const [showPlusButton, setShowPlusButton] = useState(true);
  const [showMinusButton, setShowMinusButton] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/favorites", {
          method: "GET",
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites);
          console.log("Favorites:", data.favorites);
        } else {
          setError("Failed to fetch favorites");
        }
      } catch (error) {
        setError("Error fetching favorites");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchFavorites();
    }
  }, [session]);

  const handleShowMore = () => {
    if (endIndex + 1 >= favorites.length) return;
    setStartIndex(endIndex + 1);
    setEndIndex(endIndex + 3);
    setShowPlusButton(false);
    setShowMinusButton(true);
  };

  const handleShowPrevious = () => {
    setEndIndex(startIndex - 1);
    setStartIndex(startIndex - 3);
    setShowPlusButton(true);
    setShowMinusButton(startIndex > 3);
  };

  const handleCloseDetails = () => {
    setSelectedRecipe(null);
  };

  const handleCook = async (recipeId) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
      );
      const recipeDetails = await response.json();
      setSelectedRecipe(recipeDetails);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  return (
    <div className={styles.favoritesContainer}>
      {loading && <p>Loading favorites...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {favorites.length > 0 && (
        <div className={styles.recipeListContainer}>
          <div className={styles.recipeList}>
            {favorites.slice(startIndex, endIndex + 1).map((favorite) => (
              <div key={favorite.recipe_id} className={styles.recipeCard}>
                <div className={styles.recipeDetails}>
                  <h2 className={styles.recipeTitle}>{favorite.title}</h2>
                  <img src={favorite.image} alt={favorite.title} className={styles.recipeImage} />
                  <button onClick={() => handleCook(favorite.recipe_id)} className={styles.cookThisButton}>
                    Cook this
                  </button>
                </div>
              </div>
            ))}
          </div>
          {showPlusButton && (
            <FaPlus onClick={handleShowMore} className={styles.plusButton} />
          )}
          {showMinusButton && (
            <FaMinus onClick={handleShowPrevious} className={styles.minusButton} />
          )}
        </div>
      )}
      {selectedRecipe && (
        <RecipeDetails recipe={selectedRecipe} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

export default FavoritesList;
