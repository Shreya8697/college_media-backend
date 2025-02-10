const mongoose = require("mongoose");

const groupConversationSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },
    members: { type: [String], required: true },  // Array of user IDs
    createdBy: { type: String, required: true },  // ID of the user who created the group
  },
  { timestamps: true }
);

const GroupConversation = mongoose.model("GroupConversation", groupConversationSchema);

module.exports = GroupConversation;
