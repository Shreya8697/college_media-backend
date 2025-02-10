const router = require("express").Router();
const Message = require("../models/Message");

//add
router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a message by messageId
router.put("/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

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

// Delete a message by messageId
router.delete("/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json("Message not found");
    }

    await message.deleteOne();
    res.status(200).json("Message deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/messagesId/latest', async (req, res) => {
  const { conversationId } = req.query;
  try {
    const message = await Message.findOne({ conversationId })
      .sort({ createdAt: -1 }) // Sort by latest
      .limit(1); // Return only the most recent message
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;