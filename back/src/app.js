import express from "express";
import dotenv from "dotenv";

import authRoutes from "./modules/auth/auth.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Matcha API"
  });
});

app.use("/auth", authRoutes);

app.listen(
  process.env.PORT,
  () => {
    console.log(
      `Server running on ${process.env.PORT}`
    );
  }
);