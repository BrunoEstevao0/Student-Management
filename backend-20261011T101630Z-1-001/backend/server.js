const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// ==================== MONGODB CONNECTION ====================
mongoose
  .connect("mongodb://127.0.0.1:27017/student_db")
  .then(() => {
    console.log("MongoDB connected successfully.");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

// ==================== ROUTES ====================
app.use("/api", authRoutes);

app.use("/api/students", studentRoutes);

// ==================== START SERVER ====================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});