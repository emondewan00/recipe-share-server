import express from "express";
import cors from "cors";
import userHandler from "./handler/userHandler.js";
import recipeHandler from "./handler/recipeHandler.js";
import { connectDb } from "./utils/connectDb.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

connectDb()
  .then(() => {
    app.use("/users", userHandler);
    app.use("/recipes", recipeHandler);
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}!`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });

// app.listen(port, () => {
//   console.log("app listening on port 3000!");
// });
