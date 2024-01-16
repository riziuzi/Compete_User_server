const express = require("express")
const app = express()

// importing libraries
const cors = require("cors")
const mongoose = require("mongoose")
const User = require("./database")
const jwt = require("jsonwebtoken")

// using middlewares
app.use(cors())
db = "mongodb+srv://riziuzi:8rkI2Ecz3vsXuXw6@userscluster.ogfwcvn.mongodb.net/?retryWrites=true&w=majority"       // mongo 1
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log("err"));
app.use(cors({
  origin: 'http://localhost:3000',      // should be 2999
  credentials: true,
}))
app.use(express.json())     // to parse the incoming requset's JSON formatted string to JS object (accessed in the req.body)
app.use(express.urlencoded({ extended: true }))

// GET
app.get("/", (req, res) => { res.send("Compete_User_server") })
app.get("/read-user", async (req, res) => {
  try {
    const userId = req.query.userId
    const user = await User.findOne({ userId: userId })
    if (!user) return res.status(404).send({ success: false, error: "User not found!" })
    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
})

// POST
app.post("/create-user", async (req, res) => {
  try {
    const { userId, name } = req.body
    const user = await User.findOne({ userId: userId })
    if (user) return res.status(500).send({ success: false, error: "User's profile already exists!" })

    const newUser = await User.create({
      userId: userId,
      profile: { name: name }
    })

    res.status(200).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
})
app.post("/update-user", async (req, res) => {                              // this also needs token authentication setup
  try {
    const { userId, privatePostId, publicPostId, profile } = req.body
    const user = await User.findOne({ userId: userId })
    if (!user) return res.status(404).send({ success: false, error: "User not found!" })

    if (privatePostId && user.privatePostIds.indexOf(privatePostId) === -1) {
      user.privatePostIds.push(privatePostId);
    }
    if (publicPostId && user.publicPostIds.indexOf(publicPostId) === -1) {
      user.publicPostIds.push(publicPostId);
    }
    if (profile) {
      user.profile = profile
    }
    const savedUser = await user.save()
    res.status(200).json({ success: true, user: savedUser });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
})
app.post("/make-public", async (req, res) => {
  try {
    let { postId, token } = req.body;
    let decoded = null
    token = token.replace("Bearer ", "")
    try {
      decoded = jwt.verify(token, 'Random string');
    } catch (error) {
      return res.status(401).json({ success: false, error: `Unauthorized:${error}` });
    }
    const user = await User.findOne({ userId: decoded.userId })
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    let index = user.privatePostIds.indexOf(postId);        // it has NO potential escape from data inconsistency (if postId does not exist, it wont show an error, but it should be as data cant be made public without it being private)
    if (index !== -1) {
      user.privatePostIds.splice(index, 1);
    }
    else {
      return res.status(404).json({ success: false, error: "PostId not found!" });
    }
    index = user.publicPostIds.indexOf(postId);
    if (index === -1) {
      user.publicPostIds.push(postId);
    }
    await user.save();

    res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: `Internal Server Error! ${error}`
    })
  }
})
app.post("/make-private", async (req, res) => {
  try {
    let { postId, token } = req.body;
    let decoded = null
    token = token.replace("Bearer ", "")
    try {
      decoded = jwt.verify(token, 'Random string');
    } catch (error) {
      return res.status(401).json({ success: false, error: `Unauthorized:${error}` });
    }
    const user = await User.findOne({ userId: decoded.userId })
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    let index = user.publicPostIds.indexOf(postId);        // it has NO potential escape from data inconsistency (if postId does not exist, it wont show an error, but it should be as data cant be made public without it being private)
    if (index !== -1) {
      user.publicPostIds.splice(index, 1);
    }
    else {
      return res.status(404).json({ success: false, error: "PostId not found!" });
    }
    index = user.privatePostIds.indexOf(postId);
    if (index === -1) {
      user.privatePostIds.push(postId);
    }
    await user.save();

    res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: `Internal Server Error! ${error}`
    })
  }
})

const port = process.env.PORT || 3005

app.listen(port, () => { console.log("Server started listeing on 3005") })