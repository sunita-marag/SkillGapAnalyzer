const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5174",
    credentials: true,
  })
);

app.use(express.json());

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillGap Analyzer Backend is running!",
  });
});

// ==========================================
// SIGNUP API
// ==========================================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      course,
      year,
      password,
    } = req.body;

    // ------------------------------------------
    // Validate required fields
    // ------------------------------------------

    if (
      !name ||
      !email ||
      !course ||
      !year ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // ------------------------------------------
    // Clean input
    // ------------------------------------------

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCourse = course.trim();
    const cleanYear = year.trim();

    // ------------------------------------------
    // Check if email already exists
    // ------------------------------------------

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // ------------------------------------------
    // Hash password
    // ------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ------------------------------------------
    // Create user
    // ------------------------------------------

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      course: cleanCourse,
      year: cleanYear,
      password: hashedPassword,
    });

    // ------------------------------------------
    // Send response
    // Never send password back to frontend
    // ------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        year: user.year,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `Backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();