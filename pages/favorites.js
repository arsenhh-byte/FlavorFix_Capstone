// pages/favorites.js
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if we have a valid session
    if (status === "authenticated") {
      fetch("/api/favorites")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFavorites(data.favorites);
          } else {
            setError(data.message);
          }
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [status]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Please log in to view your favorites.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Favorites</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {favorites?.length > 0 ? (
        <ul>
          {favorites.map((fav) => (
            <li key={fav.recipe_id}>
              <h3>{fav.title}</h3>
              <img src={fav.image} alt={fav.title} width="100" />
            </li>
          ))}
        </ul>
      ) : (
        <p>No favorites yet.</p>
      )}
    </div>
  );
}
