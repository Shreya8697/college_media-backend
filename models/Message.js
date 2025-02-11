const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
    isEdited: {
      type: Boolean,
      default: false, // By default, messages are not edited
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
