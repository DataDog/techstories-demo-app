const tracer = require("dd-trace").init();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// In BETA - read the JSON file containing demo posts
const posts = JSON.parse(fs.readFileSync("demo_posts.json", "utf-8"));

app.post("/generate_post", async (req, res) => {
  // In this example, we extract user data from the request body
  const { sessionId } = req.body;
  const {userName} = req.body;
  const {userEmail} = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: "User Email is required" });
  }

  console.log(`Generating post for user: ${userEmail}`);

  // Trace event in Datadog ASM with user attribution
  tracer.setUser({ 
    id: userEmail, 
    name: userName, 
    email: userEmail, 
    session_id: sessionId });

  const eventName = 'activity.call_llm_api';
  tracer.appsec.trackCustomEvent(eventName);

  // Select a post from pool of demo posts until third party API is integrated
  // Return generated post
  let randomIndex = Math.floor(Math.random() * posts.length);
  res.json({ post: posts[randomIndex] });
});

app.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});

