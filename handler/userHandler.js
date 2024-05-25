import express from "express";
import jwtToken from "../utils/jwtToken.js";
import { getDb } from "../utils/connectDb.js";
import verifyJwt from "../middleware/verifyJwt.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// Get a user by email
router.get("/me", verifyJwt, async (req, res) => {
  try {
    const db = getDb(); // Get MongoDB database instance
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req._id) });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add or login user
router.post("/", async (req, res) => {
  const { email } = req.body;
  try {
    const db = getDb(); // Get MongoDB database instance
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      const token = jwtToken(existingUser);
      res.send({
        user: existingUser,
        token: "bearer " + token,
        message: "Account login successful!",
      });
    } else {
      await db.collection("users").insertOne(req.body);
      const newUser = await db.collection("users").findOne({ email });
      const token = jwtToken(newUser);
      res.send({
        user: newUser,
        token: "bearer " + token,
        message: "Account created successfully!",
      });
    }
  } catch (error) {
    console.log("Error in server:", error);
    res.status(500).send({ success: false, message: "Server error", error });
  }
});

export default router;
