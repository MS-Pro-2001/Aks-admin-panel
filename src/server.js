const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://aks-admin-panel.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// Export socket instance for use in other files
module.exports.io = io;

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Attach user data to socket
    socket.userId = user._id;
    socket.userEmail = user.email;
    socket.userRole = user.role;

    next();
  } catch (error) {
    next(new Error("Authentication error: " + error.message));
  }
});

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "https://aks-admin-panel.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://0.0.0.0:27017/crud_app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(
    `User connected - Email: ${socket.userEmail}, Role: ${socket.userRole}, SocketID: ${socket.id}`
  );

  // Join a room based on user ID for private messages
  socket.join(socket.userId.toString());

  socket.on("disconnect", () => {
    console.log(`User disconnected - Email: ${socket.userEmail}`);
  });
});

// Routes
app.use("/api", require("./routes"));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
