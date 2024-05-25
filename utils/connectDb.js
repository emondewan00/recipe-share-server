import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
let _db;
const uri = process.env.CON_STR;
export const connectDb = async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    _db = client.db("recipe");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export const getDb = () => {
  if (!_db) {
    throw new Error("Database not initialized");
  }
  return _db;
};
