const router = require("express").Router();
const GroupConversation = require("../models/GroupConversation");

// New group conversation (for multiple members)
router.post("/", async (req, res) => {
  try {
    const { groupName, members, createdBy } = req.body;

    // Validate required fields
    if (!groupName || !members || !Array.isArray(members) || members.length === 0 || !createdBy) {
      return res.status(400).json({
        message: "Invalid input. 'groupName', 'members' (non-empty array), and 'createdBy' are required.",
      });
    }

    // Ensure the creator is part of the group
    if (!members.includes(createdBy)) {
      members.push(createdBy); // Add the creator to the members array
    }

    // Check for duplicate group name for the same creator (optional)
    const existingGroup = await GroupConversation.findOne({ groupName, createdBy });
    if (existingGroup) {
      return res.status(409).json({ message: "A group with this name already exists for the creator." });
    }

    // Create a new group conversation document
    const newConversation = new GroupConversation({
      groupName,
      members, // Array of user IDs
      createdBy, // User ID of the creator
    });

    // Save to the database
    const savedConversation = await newConversation.save();

    // Respond with the created group
    res.status(201).json(savedConversation);
  } catch (err) {
    console.error("Error creating group conversation:", err);
    res.status(500).json({
      message: "An error occurred while creating the group conversation.",
      error: err.message,
    });
  }
});


// Get all group conversations for a specific user (by userId)
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all group conversations where the user is a member
    const conversations = await GroupConversation.find({
      members: { $in: [userId] }, // User is included in the members array
    }).populate("members", "username email") // Optional: Populate member details if you have a User schema
      .populate("createdBy", "username email"); // Optional: Populate creator details if needed

    // Return the group conversations
    res.status(200).json(conversations);
  } catch (err) {
    // Handle errors and respond with an appropriate status code
    res.status(500).json({ message: "Error fetching group conversations", error: err });
  }
});


// Get a specific group conversation that includes all specified user IDs
// (for an exact match of users in the group)
router.get("/find/:userIds", async (req, res) => {
  try {
    const userIds = req.params.userIds.split(",");  // Expecting a comma-separated list of user IDs
    const groupConversation = await GroupConversation.findOne({
      members: { $all: userIds },  // Ensure the group has exactly these users
    });

    if (!groupConversation) {
      return res.status(404).json({ message: "Group conversation not found." });
    }

    res.status(200).json(groupConversation);  // Return the found group conversation
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a group conversation by groupConversationId
router.delete("/:conversationId", async (req, res) => {
  try {
    const deletedConversation = await GroupConversation.findByIdAndDelete(req.params.conversationId);

    if (!deletedConversation) {
      return res.status(404).json({ message: "Group conversation not found." });
    }

    res.status(200).json({ message: "Group conversation has been deleted." });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Remove all users from the group conversation (delete all members)
router.delete("/delete-group/:conversationId", async (req, res) => {
  try {
    const groupConversation = await GroupConversation.findById(req.params.conversationId);

    if (!groupConversation) {
      return res.status(404).json({ message: "Group conversation not found." });
    }

    groupConversation.members = [];  // Clear all members from the group
    await groupConversation.save();

    res.status(200).json({ message: "All users removed from the group conversation." });
  } catch (err) {
    res.status(500).json(err);
  }
});



// Update the name of a group conversation
router.put("/update-name/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  const { newGroupName } = req.body;

  try {
    // Validate the new group name
    if (!newGroupName || newGroupName.trim() === "") {
      return res.status(400).json({ message: "Group name cannot be empty." });
    }

    // Find the group conversation by ID and update the name
    const updatedConversation = await GroupConversation.findByIdAndUpdate(
      conversationId,
      { groupName: newGroupName.trim() },
      { new: true } // Return the updated document
    );

    // Check if the group was found
    if (!updatedConversation) {
      return res.status(404).json({ message: "Group conversation not found." });
    }

    // Return the updated group conversation
    res.status(200).json({
      message: "Group name updated successfully.",
      groupConversation: updatedConversation,
    });
  } catch (err) {
    console.error("Error updating group name:", err);
    res.status(500).json({
      message: "An error occurred while updating the group name.",
      error: err.message,
    });
  }
});


// Remove a user from the group by the group creator
router.put("/remove-user/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body; // User ID to remove
  const { currentUserId } = req.body; // Current logged-in user (group creator)

  try {
    // Find the group conversation
    const groupConversation = await GroupConversation.findById(conversationId);

    if (!groupConversation) {
      return res.status(404).json({ message: "Group conversation not found." });
    }

    // Check if the current user is the group creator
    if (groupConversation.createdBy.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only the group creator can remove members." });
    }

    // Remove the user from the members array
    const updatedMembers = groupConversation.members.filter(
      (member) => member.toString() !== userId
    );

    if (updatedMembers.length === groupConversation.members.length) {
      return res.status(404).json({ message: "User not found in the group." });
    }

    // Update the group conversation with the new members array
    groupConversation.members = updatedMembers;
    await groupConversation.save();

    res.status(200).json({ message: "User removed from the group successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error removing user from group.", error: err.message });
  }
});


// Allow a member to leave the group
router.put("/leave-group/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body; // User ID who wants to leave the group

  try {
    // Find the group conversation
    const groupConversation = await GroupConversation.findById(conversationId);

    if (!groupConversation) {
      return res.status(404).json({ message: "Group conversation not found." });
    }

    // Check if the user is a member of the group
    if (!groupConversation.members.includes(userId)) {
      return res.status(404).json({ message: "User is not a member of this group." });
    }

    // Remove the user from the members array
    groupConversation.members = groupConversation.members.filter(
      (member) => member.toString() !== userId
    );
    
    await groupConversation.save();

    res.status(200).json({ message: "User left the group successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error while leaving the group.", error: err.message });
  }
});



// Update members within the group by the group creator
router.put("/update-members/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  const { currentUserId, newMembers } = req.body; // Current user (group creator) and new members

  try {
    // Validate the new members input
    if (!Array.isArray(newMembers) || newMembers.length === 0) {
      return res.status(400).json({ message: "New members array is required." });
    }

    // Find the group conversation
    const groupConversation = await GroupConversation.findById(conversationId);

    if (!groupConversation) {
      return res.status(404).json({ message: "Group conversation not found." });
    }

    // Check if the current user is the group creator
    if (groupConversation.createdBy.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only the group creator can update members." });
    }

    // Update the group members (adding new members)
    groupConversation.members = [...new Set([...groupConversation.members, ...newMembers])]; // Avoid duplicates
    await groupConversation.save();

    res.status(200).json({ message: "Group members updated successfully.", groupConversation });
  } catch (err) {
    res.status(500).json({ message: "Error updating group members.", error: err.message });
  }
});




module.exports = router;
