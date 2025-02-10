const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");    
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");           
const conversationsRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const groupConversationsRoute = require("./routes/groupConversations");
const groupMessagesRoute = require("./routes/groupMessages");
const router = express.Router();
const path = require("path");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL + "/collegemedia", {
    //  useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

  app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },     
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({storage:storage});
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    res.status(200).json("File uploaded successfully!");
  } catch (err) {
    res.status(500).json("An error occurred while uploading the file.");
  }
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationsRoute);
app.use("/api/messages", messageRoute);
app.use("/api/groups", groupConversationsRoute);
app.use("/api/group-messages", groupMessagesRoute);

app.listen(8800, () => {
  console.log("Backend server is running! College Media");
});
