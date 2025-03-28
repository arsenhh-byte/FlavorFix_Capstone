// components/FavoritesList.jsx
import React, { useState, useEffect } from "react";
import styles from "../styles/favorites.module.css";
import RecipeDetails from "./RecipeDetails";
import { useSession } from "next-auth/react";

const FavoritesList = () => {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

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
      } catch (err) {
        setError("Error fetching favorites");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchFavorites();
    }
  }, [session]);

  const handleRemoveFavorite = async (recipe_id) => {
    try {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id }),
      });
      if (response.ok) {
        setFavorites((prev) => prev.filter((fav) => fav.recipe_id !== recipe_id));
      } else {
        console.error("Failed to remove favorite");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
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

  const handleCloseDetails = () => {
    setSelectedRecipe(null);
  };

  return (
    <>
      <div className={styles.sidebar}>
        <h2 className={styles.header}>Favorites</h2>
        {loading && <p className={styles.message}>Loading favorites...</p>}
        {error && <p className={styles.message}>{error}</p>}
        {favorites.length === 0 ? (
          !loading && <p className={styles.message}>No favorites added yet.</p>
        ) : (
          <div className={styles.favoritesList}>
            {favorites.map((fav) => (
              <div key={fav.recipe_id} className={styles.favoriteCard}>
                <h3 className={styles.recipeTitle}>{fav.title}</h3>
                <img
                  src={fav.image}
                  alt={fav.title}
                  className={styles.recipeImage}
                />
                <div className={styles.buttonRow}>
                  <button
                    onClick={() => handleCook(fav.recipe_id)}
                    className={styles.cookThisButton}
                  >
                    Cook this
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(fav.recipe_id)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Recipe Details (centered in the page) */}
      {selectedRecipe && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <RecipeDetails recipe={selectedRecipe} onClose={handleCloseDetails} />
          </div>
        </div>
      )}
    </>
  );
};

export default FavoritesList;