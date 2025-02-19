const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT secret key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Sign Up
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, address, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already registered.Please Sign In" });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      phoneNumber,
      address,
      role,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Sign In
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is verified (except for admin)
    if (user.role !== "admin" && !user.isVerified) {
      return res
        .status(403)
        .json({ message: "Your account is pending verification by admin" });
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error signing in", error: error.message });
  }
};
