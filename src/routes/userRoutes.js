const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// All routes are protected
router.use(auth);

// Protected routes
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Admin routes for user verification
router.get("/admin/pending", userController.getPendingUsers);
router.post("/admin/verify/:userId", userController.verifyUser);

module.exports = router;
