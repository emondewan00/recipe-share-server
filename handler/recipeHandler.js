import express from "express";
import verifyJwt from "../middleware/verifyJwt.js";
import { ObjectId } from "mongodb";
import { getDb } from "../utils/connectDb.js";

const router = express.Router();

// Get all recipes
router.get("/", async (req, res) => {
  try {
    const db = getDb(); // Get MongoDB database instance
    const recipes = await db.collection("recipes").find({}).toArray();
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single recipe
router.get("/:id", verifyJwt, async (req, res) => {
  try {
    const db = getDb(); // Get MongoDB database instance
    const recipe = await db
      .collection("recipes")
      .findOne({ _id: ObjectId(req.params.id) });
    if (!recipe) {
      res.status(404).json({ message: "Recipe not found" });
      return;
    }
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post recipe
router.post("/", verifyJwt, async (req, res) => {
  const recipe = req.body;
  try {
    const db = getDb(); // Get MongoDB database instance
    const result = await db.collection("recipes").insertOne({
      ...recipe,
      creatorEmail: req.email,
      watchCount: 0,
      purchased_by: [],
      createdAt: Date.now(),
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update recipe
router.put("/:id", verifyJwt, async (req, res) => {
  try {
    const db = getDb(); // Get MongoDB database instance
    const result = await db
      .collection("recipes")
      .findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: req.body },
        { returnOriginal: false }
      );
    res.status(200).json(result.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
