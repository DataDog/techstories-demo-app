const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; 

function generateSessionId() {
  return crypto.randomBytes(16).toString("hex");
}

async function callLLMApi(userEmail) {
  console.log(`Calling third-party API for ${userEmail}`);

  const response = await fetch("https://thirdparty.com/api/generate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${JWT}`, 
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userEmail }),
  });

  if (!response.ok) {
    console.error("Error calling third-party API", response.status);
    return null;
  }

  return await response.json();
}

app.post("/generate_post", async (req, res) => {
  const { userId, userName, userEmail } = req.body;

  if (!userEmail || !userId) {
    return res.status(400).json({ error: "User Email and User ID are required" });
  }

  console.log(`Generating post for user: ${userEmail}`);

  const user = {
    id: userId,
    name: userName,
    email: userEmail,
    session_id: generateSessionId(),
  };

  // Call third-party API
  const apiResponse = await callLLMApi(userEmail);
  if (!apiResponse) {
    return res.status(500).json({ error: "Failed to retrieve data from third-party API" });
  }

  res.json({ message: "Post generated successfully", thirdPartyResponse: apiResponse });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



