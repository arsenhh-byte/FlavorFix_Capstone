// components/RecipeList.jsx
import React from "react";
import { useCart } from "../context/CartContext";
import styles from "../styles/list.module.css";
import RecipeDetails from "./RecipeDetails";

const RecipeList = ({ recipes, isLoggedIn }) => {
  // Determine which array holds the recipes from the API response.
  let recipeList = [];
  if (Array.isArray(recipes.recipes)) {
    recipeList = recipes.recipes;
  } else if (Array.isArray(recipes.results)) {
    recipeList = recipes.results;
  } else {
    return <p>No recipes available.</p>;
  }

  const { addToCart } = useCart();
  const [displayedRecipes, setDisplayedRecipes] = React.useState(6);
  const [selectedRecipe, setSelectedRecipe] = React.useState(null);
  const slicedRecipes = recipeList.slice(0, displayedRecipes);

  const handleLoadMore = () => {
    setDisplayedRecipes(displayedRecipes + 6);
  };

  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

  const handleCook = async (recipeId) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
      );
      const recipeDetails = await response.json();
      setSelectedRecipe(recipeDetails);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  // IMPORTANT: Make sure to pass the property "recipe_id" (not just "id").
  const handleAddToCart = (recipe) => {
    if (!isLoggedIn) {
      alert("Please log in first to add to cart.");
      return;
    }
    // Ensure the recipe object has an id. Convert to string if necessary.
    const recipeId = recipe.id ? recipe.id.toString() : "";
    if (!recipeId) {
      console.error("Recipe object is missing 'id':", recipe);
      return;
    }
    const cartItem = {
      recipe_id: recipeId,     // Required field as per your schema.
      title: recipe.title,     // API field: recipe title.
      image: recipe.image,     // API field: recipe image.
      chefEmail: recipe.chefEmail || "", // if available
      deliveryAddress: recipe.deliveryAddress || "", // if provided by API; otherwise user can fill it later.
      quantity: 1,
    };
    console.log("[RecipeList] Adding to cart:", cartItem);
    addToCart(cartItem);
  };

  const handleFavorite = (recipeId) => {
    if (!isLoggedIn) {
      alert("Log in or register first to favorite.");
      return;
    }
    console.log(`Recipe ${recipeId} favorited/unfavorited`);
  };

  const handleCloseDetails = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className={styles.container}>
      {selectedRecipe ? (
        <RecipeDetails recipe={selectedRecipe} onClose={handleCloseDetails} />
      ) : (
        <>
          <h2>Recipes</h2>
          <div className={styles.recipeListContainer}>
            <div className={styles.recipeList}>
              {slicedRecipes.map((recipe) => (
                <div key={recipe.id} className={styles.recipeCard}>
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className={styles.recipeImg}
                  />
                  <div className={styles.recipeDetails}>
                    <h3 className={styles.recipeName}>{recipe.title}</h3>
                    <p>Recipe ID: {recipe.id}</p>
                    <button
                      onClick={() => handleCook(recipe.id)}
                      className={styles.cookThisButton}
                    >
                      Cook this
                    </button>
                    {isLoggedIn && (
                      <>
                        <button
                          onClick={() => handleFavorite(recipe.id)}
                          className={styles.favoriteButton}
                        >
                          Favorite
                        </button>
                        <button
                          onClick={() => handleAddToCart(recipe)}
                          className={styles.addToCartButton}
                        >
                          Add to Cart
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {displayedRecipes < recipeList.length && (
            <button onClick={handleLoadMore} className={styles.loadMoreButton}>
              Load More Recipes
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default RecipeList;