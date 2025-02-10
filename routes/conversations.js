const router = require("express").Router();
const Conversation = require("../models/Conversation");

//new conv
router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId
router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation)
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation)
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete conversation by conversationId
router.delete("/:conversationId", async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.conversationId);
    if (conversation) {
      res.status(200).json("Conversation has been deleted.");
    } else {
      res.status(404).json("Conversation not found.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete conversation between two users
router.delete("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    if (conversation) {
      res.status(200).json("Conversation between the two users has been deleted.");
    } else {
      res.status(404).json("Conversation not found.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


// //group
// router.post("/group", async (req, res) => {
//   const newConversation = new Conversation({
//     members: req.body.members, // Expecting an array of user IDs
//   });

//   try {
//     const savedConversation = await newConversation.save();
//     res.status(200).json(savedConversation);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });


router.get('/messages/latest', async (req, res) => {
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