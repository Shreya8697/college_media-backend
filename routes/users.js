const { Promise } = require("mongoose");
const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been Updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only Your Account");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been Deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only Your Account");
  }
});


//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username:username});
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all users
router.get("/all", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Return users excluding sensitive data (like passwords)
    const userList = users.map(user => {
      const { password, updatedAt, ...other } = user._doc;
      return other;
    });

    // Send the list of users as response
    res.status(200).json(userList);
  } catch (err) {
    // Handle any errors
    res.status(500).json({ error: "An error occurred while fetching users", details: err });
  }
});


//get friends

router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    // const friends = await Promise.all(
    //   user.followings.map((friendId) => {
    //     return User.findById(friendId);
    //   })
    // );
    const friends = [];
    for (const friendId of user.followings) {
      try {
        const friend = await User.findById(friendId);
        friends.push(friend);
      } catch (error) {
        console.error(`Error finding user by ID ${friendId}:`, error);
        friends.push(null); // Optionally push null or handle the error case
      }
    }
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been Followed");
      } else {
        res.status(403).json("you already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you can't follow yourself");
  }
});
//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  // Check if the user is trying to unfollow themselves
  if (req.body.userId !== req.params.id) {
    try {
      // Fetch the user to be unfollowed and the current user
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      // Check if the current user is already following the user
      if (user.followers.includes(req.body.userId)) {
        // Update the followers and followings arrays
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });

        // Send success response
        res.status(200).json("User has been unfollowed");
      } else {
        // Send error response if the current user is not following the user
        res.status(403).json("You don't follow this user");
      }
    } catch (err) {
      // Log error and send error response
      res.status(500).json({ error: "An error occurred while trying to unfollow the user", details: err });
    }
  } else {
    // Send error response if the user is trying to unfollow themselves
    res.status(403).json("You can't unfollow yourself");
  }
});

module.exports = router;
