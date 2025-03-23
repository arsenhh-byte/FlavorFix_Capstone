// pages/api/cook.js
import dbConnect from "../../backend/config/db";
import Recipe from "../../backend/models/Recipe"; // If you have a Recipe model to update status
// Alternatively, you could just log the action or update a "cooked" status field on a different collection.

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { recipe_id, title, chef } = req.body;
    if (!recipe_id || !title || !chef) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
      // Here you can update the recipe status to "cooking" or log the chef's action.
      // For demonstration, we simply return a success message.
      return res.status(200).json({ success: true, message: `Chef ${chef} is cooking ${title}!` });
    } catch (error) {
      console.error("Error cooking meal:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
