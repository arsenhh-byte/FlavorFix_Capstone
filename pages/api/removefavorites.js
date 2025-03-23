import dbConnect from '../../backend/config/db';
import User from '../../backend/models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { username, recipe_id } = req.body;
    if (!username || !recipe_id) {
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

      // Remove the favorite from the user's favorites array
      user.favorites = user.favorites.filter(
        (fav) => fav.recipe_id !== recipe_id
      );
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Favorite removed successfully!" });
    } catch (error) {
      console.error("Error removing favorite:", error);
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
