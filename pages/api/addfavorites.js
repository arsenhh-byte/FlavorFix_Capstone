import dbConnect from '../../backend/config/db';
import User from '../../backend/models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { username, recipe_id, title, image } = req.body;
    if (!username || !recipe_id || !title) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    try {
      // Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Optionally check if the recipe is already in favorites to avoid duplicates
      const alreadyFavorited = user.favorites.some(
        (fav) => fav.recipe_id === recipe_id
      );
      if (alreadyFavorited) {
        return res
          .status(400)
          .json({ success: false, message: "Recipe is already favorited" });
      }

      // Add the new favorite to the user's favorites array
      user.favorites.push({ recipe_id, title, image });
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Favorite added successfully!" });
    } catch (error) {
      console.error("Error adding favorite:", error);
      return res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
}
