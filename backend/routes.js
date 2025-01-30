import express from "express";
import mongoose from "mongoose";
import Tool from "./Mongo/Tool.js"; // Ensure correct path
import { mongoDBURL } from "./Mongo/config.js";
import cors from "cors";

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's origin
    credentials: true,
  })
);

// MongoDB Connection
console.log(mongoDBURL);
mongoose
  .connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection failed:", error));

app.post("/define_tool", async (req, res) => {
  try {
    const { name, description, fields } = req.body;

    // Validate fields structure
    if (!fields || typeof fields !== "object") {
      return res.status(400).json({ error: "Invalid fields format" });
    }

    const newTool = new Tool({ name, description, fields });
    await newTool.save();
    res.status(201).json({ message: "Tool saved successfully", tool: newTool });
  } catch (error) {
    res.status(500).json({ error: "Failed to save tool" });
  }
});

// Fetch all tools
app.get("/list_tools", async (req, res) => {
  try {
    const tools = await Tool.find();
    res.status(200).json({ tools });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tools" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
