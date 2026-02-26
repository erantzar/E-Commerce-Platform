import express from "express";
import connectDB from "./sec/config/db.js";
import "dotenv/config"; // טוען משתני סביבה

const app = express();

app.use(express.json());


app.use((_, res) => {
  console.log("404 - Not Found");
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    console.log("DB connected");

    app.listen(PORT, () => 
      console.log(`Server running on port ${PORT}`)
    );

  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

start();