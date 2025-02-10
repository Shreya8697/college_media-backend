const mongoose = require("mongoose");

const GroupMessageSchema = new mongoose.Schema(
  {
    groupConversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupConversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

module.exports = mongoose.model("GroupMessage", GroupMessageSchema);
