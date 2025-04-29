const crypto = require('crypto');
const tracer = require("dd-trace").init();

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

function generateSessionId() {
  return crypto.randomBytes(16).toString('hex'); // Generates a 32-character hexadecimal string
}

function getGeneratedPost(posts) {
  // In Demo - read the JSON file containing demo posts
  // Represents a function that makes a call to a third-party LLM
  const allPosts = JSON.parse(fs.readFileSync("demo_posts.json", "utf-8"));
  const randomIndex = Math.floor(Math.random() * allPosts.length);
  return allPosts[randomIndex];
}

app.get("/hello", async (req, res) => {
  res.json({ message: "Hello from Generate Post API!" });
});

app.post("/generate_post", async (req, res) => {
  // Extract user data from the request body
  const { userId, userName, userEmail } = req.body;

  if (!userEmail || !userId) {
    return res.status(400).json({ error: "User Email and User ID are required" });
  }

  console.log(`Generating post for user: ${userEmail}`);

  user = {
    id: userId,
    name: userName,
    email: userEmail,
    session_id: generateSessionId(),
  };

  // Return generated post
  const post = getGeneratedPost();
  
  res.json({ post: post });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


