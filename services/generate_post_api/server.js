const tracer = require("dd-trace").init();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

function getGeneratedPost(posts) {
  // In Demo - read the JSON file containing demo posts
  // Represents a function that makes a call to a third-party LLM
  const allPosts = JSON.parse(fs.readFileSync("demo_posts.json", "utf-8"));
  const randomIndex = Math.floor(Math.random() * allPosts.length);
  return allPosts[randomIndex];
}

app.post("/generate_post", async (req, res) => {
  // Extract user data from the request body
  const { sessionId, userName, userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: "User Email is required" });
  }

  console.log(`Generating post for user: ${userEmail}`);

  user = {
    id: userEmail,
    name: userName,
    email: userEmail,
    session_id: sessionId,
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


