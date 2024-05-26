import express from "express";
import verifyJwt from "../middleware/verifyJwt.js";
import { ObjectId } from "mongodb";
import { getDb } from "../utils/connectDb.js";

const router = express.Router();

//get all recipes
router.get("/", async (req, res) => {
  try {
    const db = getDb(); // Get MongoDB database instance
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: "i" };
    }
    if (req.query.category) {
      query.category = { $regex: req.query.category, $options: "i" };
    }
    if (req.query.country) {
      query.country = { $regex: req.query.country, $options: "i" };
    }
    const totalLength = await db.collection("recipes").find(query).count();

    // calculate how many pages are available
    const totalPages = Math.ceil(totalLength / limit);
    const morePages = totalPages > page;

    // If the page number is greater than the total number of pages, return an error
    if (page > totalPages) {
      return res.status(400).json({
        status: "error",
        message: `Page ${page} does not exist. There are only ${totalPages} pages.`,
      });
    }

    const recipes = await db
      .collection("recipes")
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    if (recipes.length === 0 && skip !== 0) {
      return res.status(200).json({
        status: "success",
        recipes: [],
        length: recipes.length,
        morePages,
      });
    }

    res.status(200).json({
      status: "success",
      recipes,
      length: recipes.length,
      morePages,
    });
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

router.patch("/purchased", verifyJwt, async (req, res) => {
  try {
    const { recipe_id, email, creatorEmail } = req.body;
    const db = getDb(); // Get MongoDB database instance
    const result = await db
      .collection("recipes")
      .findOneAndUpdate(
        { _id: new ObjectId(recipe_id) },
        { $push: { purchased_by: email } },
        { returnOriginal: false }
      );

    const addCoinInCreatorAccount = await db
      .collection("users")
      .findOneAndUpdate(
        {
          creatorEmail: creatorEmail,
        },
        { $inc: { coins: 1 } }
      );
    const removeCoinsFromBuyer = await db
      .collection("users")
      .findOneAndUpdate({ email: email }, { $inc: { coins: -10 } });
    console.log(result,removeCoinsFromBuyer,addCoinInCreatorAccount);
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
