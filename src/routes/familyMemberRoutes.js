const express = require("express");
const router = express.Router();
const familyMemberController = require("../controllers/familyMemberController");
const auth = require("../middleware/auth");

// All routes are protected with auth middleware
router.use(auth);

// Create a new family member
router.post("/", familyMemberController.createFamilyMember);

// Get all family members
router.get("/", familyMemberController.getFamilyMembers);

// Get a specific family member
router.get("/:id", familyMemberController.getFamilyMember);

// Update a family member
router.put("/:id", familyMemberController.updateFamilyMember);

// Delete a family member
router.delete("/:id", familyMemberController.deleteFamilyMember);

module.exports = router;
