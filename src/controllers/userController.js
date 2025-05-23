const User = require("../models/User");
const SocketService = require("../services/socketService");

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Get status from query params
    const { status } = req.query;

    // Prepare filter based on status
    let filter = {};
    if (status && status !== "all") {
      filter.verifyStatus = status;
    }

    // Get users based on filter
    const users = await User.find(filter);

    // Get counts for each status
    const counts = {
      total: await User.countDocuments(),
      pending: await User.countDocuments({ verifyStatus: "pending" }),
      approved: await User.countDocuments({ verifyStatus: "verified" }),
      rejected: await User.countDocuments({ verifyStatus: "rejected" }),
    };

    res.status(200).json({
      counts,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    // Users can only access their own data unless they're admin
    if (req.params.id !== req.user.userId) {
      const user = await User.findById(req.user.userId);
      if (user.role !== "admin") {
        return res.status(403).json({
          message: "Access denied. You can only view your own profile.",
        });
      }
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    // Users can only update their own data
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You can only update your own profile.",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Don't allow role updates through this endpoint
    delete req.body.role;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    // Users can only delete their own account
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own account.",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending verification requests (admin only)
exports.getPendingUsers = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const pendingUsers = await User.find({
      isVerified: false,
      role: "client",
    });

    res.status(200).json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify or reject user (admin only)
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'verify' or 'reject'

    // Check if user is admin
    const admin = await User.findById(req.user.userId);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "verify") {
      user.isVerified = true;
      user.verifyStatus = "verified";
      await user.save();

      // Emit status update events
      SocketService.emitStatusUpdate({
        userId: user._id,
        status: "verified",
        message: "User verification approved",
      });

      // Notify the specific user
      SocketService.emitToUser(user._id.toString(), "verification-status", {
        status: "verified",
        message: "Your account has been verified",
      });

      res.status(200).json({ message: "User verified successfully", user });
    } else if (action === "reject") {
      user.isVerified = false;
      user.verifyStatus = "rejected";
      await user.save();

      // Emit status update events
      SocketService.emitStatusUpdate({
        userId: user._id,
        status: "rejected",
        message: "User verification rejected",
      });

      // Notify the specific user
      SocketService.emitToUser(user._id.toString(), "verification-status", {
        status: "rejected",
        message: "Your account verification was rejected",
      });

      res
        .status(200)
        .json({ message: "User rejected and removed successfully", user });
    } else {
      res
        .status(400)
        .json({ message: "Invalid action. Use 'verify' or 'reject'" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
