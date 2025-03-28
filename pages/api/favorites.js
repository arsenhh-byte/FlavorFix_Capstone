// pages/api/favorites.js
import dbConnect from '../../backend/config/db';
import User from '../../backend/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';

export default async function handler(req, res) {
  await dbConnect();

  // Retrieve the session using NextAuth
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in to access favorites."
    });
  }

  // Use the user's email from the session for lookup
  const email = session.user.email;

  switch (req.method) {
    case 'GET': {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
        // Ensure favorites exists
        if (!user.favorites) user.favorites = [];
        return res.status(200).json({ success: true, favorites: user.favorites });
      } catch (error) {
        console.error("Error fetching favorites:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }

    case 'POST': {
      try {
        const { recipe_id, title, image } = req.body;
        if (!recipe_id || !title) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields: recipe_id and title are required"
          });
        }

        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        // Ensure favorites is an array
        if (!user.favorites) {
          user.favorites = [];
        }

        // Check if already favorited
        const alreadyFavorited = user.favorites.some(
          (fav) => fav.recipe_id === recipe_id
        );
        if (alreadyFavorited) {
          return res.status(400).json({
            success: false,
            message: "Recipe already in favorites"
          });
        }

        // Add the new favorite and save
        user.favorites.push({ recipe_id, title, image });
        await user.save();

        return res.status(200).json({
          success: true,
          message: "Favorite added successfully!"
        });
      } catch (error) {
        console.error("Error adding favorite:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }

    case 'DELETE': {
      try {
        const { recipe_id } = req.body;
        if (!recipe_id) {
          return res.status(400).json({
            success: false,
            message: "recipe_id is required to remove a favorite"
          });
        }

        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        // Ensure favorites is an array before filtering
        if (!user.favorites) {
          user.favorites = [];
        }

        // Remove the favorite matching recipe_id
        user.favorites = user.favorites.filter(
          (fav) => fav.recipe_id !== recipe_id
        );
        await user.save();

        return res.status(200).json({
          success: true,
          message: "Favorite removed successfully!"
        });
      } catch (error) {
        console.error("Error removing favorite:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }

    default:
      return res.status(405).json({
        success: false,
        message: "Method not allowed"
      });
  }
}