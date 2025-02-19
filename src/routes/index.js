const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const familyMemberRoutes = require("./familyMemberRoutes");

// Base route
router.get("/", (req, res) => {
  res.json({ message: "Welcome to the AKS API" });
});

// Auth routes
router.use("/auth", authRoutes);

// User routes - all user routes will be prefixed with /api/users
router.use("/users", userRoutes);

// Family member routes - all family member routes will be prefixed with /api/family-members
router.use("/family-members", familyMemberRoutes);

module.exports = router;
