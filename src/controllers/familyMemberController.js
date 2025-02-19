const FamilyMember = require("../models/FamilyMember");
const User = require("../models/User");

// Create a new family member
exports.createFamilyMember = async (req, res) => {
  try {
    const { fullName, relationship, dateOfBirth, phoneNumber } = req.body;
    const userId = req.user.userId;

    const familyMember = new FamilyMember({
      fullName,
      relationship,
      dateOfBirth,
      phoneNumber,
      userId,
    });

    await familyMember.save();

    // Add family member to user's members array
    await User.findByIdAndUpdate(
      userId,
      { $push: { members: familyMember._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Family member added successfully",
      familyMember,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding family member", error: error.message });
  }
};

// Get all family members for a user
exports.getFamilyMembers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const familyMembers = await FamilyMember.find({ userId });

    res.json(familyMembers);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching family members",
      error: error.message,
    });
  }
};

// Get a specific family member
exports.getFamilyMember = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!familyMember) {
      return res.status(404).json({ message: "Family member not found" });
    }

    res.json(familyMember);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching family member",
      error: error.message,
    });
  }
};

// Update a family member
exports.updateFamilyMember = async (req, res) => {
  try {
    const updates = req.body;
    const familyMember = await FamilyMember.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!familyMember) {
      return res.status(404).json({ message: "Family member not found" });
    }

    res.json({
      message: "Family member updated successfully",
      familyMember,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating family member",
      error: error.message,
    });
  }
};

// Delete a family member
exports.deleteFamilyMember = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!familyMember) {
      return res.status(404).json({ message: "Family member not found" });
    }

    // Remove family member from user's members array
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { members: req.params.id },
    });

    res.json({ message: "Family member deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting family member",
      error: error.message,
    });
  }
};
