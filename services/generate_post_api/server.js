const crypto = require('crypto');
const tracer = require("dd-trace").init();

// const tracer = require('dd-trace').init({
//   appsec: {
//     blockedTemplateJson: './custom_blocked_response.json'
//   }
// })

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

  if (tracer.appsec.isUserBlocked(user)) { 
    console.log(`User ${userEmail} is blocked`);
    return tracer.appsec.blockRequest(req, res); // Blocking response is sent with status code 403
  }

  // If user is not blocked, continue with the generate_post request
  const eventName = "activity.call_llm_api";
  tracer.appsec.trackCustomEvent(eventName);

  // Return generated post
  const post = getGeneratedPost();
  
  res.json({ post: post });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


