const tracer = require("dd-trace").init();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());

// Read the JSON file containing posts
const posts = JSON.parse(fs.readFileSync("demo_posts.json", "utf-8"));

app.get("/generate_post", async (req, res) => {
  // Trace this event in ASM
  const eventName = 'activity.call_llm_api';
  tracer.appsec.trackCustomEvent(eventName);
  
  let randomIndex = Math.floor(Math.random() * posts.length);

  // Respond with a random post
  res.json({ post: posts[randomIndex] });
});

app.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});

