import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import getInfo from "./routes/info";
import login from "./routes/login";
import searchLectures from "./routes/search";

(async () => {
  dotenv.config();

  const PORT = process.env.PORT || 4000;

  if (!process.env.DB_URL) {
    throw new Error("DB_URL is not defined");
  }

  await mongoose
    .connect(process.env.DB_URL, {
      authSource: "admin",
    })
    .then(() => console.log("Connected to MongoDB"));

  const app = express();
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
    })
  );
  app.use(bodyParser.json());

  app.use("/search", searchLectures);
  app.use("/info", getInfo);
  app.use("/login", login);

  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
})();
