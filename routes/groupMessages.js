const router = require("express").Router();
const GroupMessage = require("../models/GroupMessage");

// // Add a new group message
// router.post("/", async (req, res) => {
//   const newMessage = new GroupMessage(req.body);

//   try {
//     const savedMessage = await newMessage.save();
//     res.status(200).json(savedMessage);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.post("/", async (req, res) => {
  console.log("Incoming request body:", req.body); // Log request body

  const newMessage = new GroupMessage(req.body);

  try {
    const savedMessage = await newMessage.save();
    console.log("Message saved successfully:", savedMessage); // Log saved message
    res.status(200).json(savedMessage);
  } catch (err) {
    console.error("Error saving message:", err); // Log error details
    res.status(500).json({ message: "Error saving message", error: err });
  }
});


// Get all messages in a group conversation by groupConversationId
router.get("/:groupConversationId", async (req, res) => {
  try {
    const messages = await GroupMessage.find({
      groupConversationId: req.params.groupConversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a group message by messageId
router.put("/:messageId", async (req, res) => {
  try {
    const message = await GroupMessage.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json("Message not found");
    }

    // Update message text
    message.text = req.body.text || message.text; // Use new text if provided, else keep the old one
    message.isEdited = true; // Optionally mark message as edited
    
    const updatedMessage = await message.save();
    res.status(200).json(updatedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a group message by messageId
router.delete("/:messageId", async (req, res) => {
  try {
    const message = await GroupMessage.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json("Message not found");
    }

    await message.deleteOne();
    res.status(200).json("Message deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get the latest message in a group conversation
router.get("/latest/:groupConversationId", async (req, res) => {
  try {
    const message = await GroupMessage.findOne({
      groupConversationId: req.params.groupConversationId,
    })
      .sort({ createdAt: -1 }) // Sort by latest
      .limit(1); // Return only the most recent message
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
