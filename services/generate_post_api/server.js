const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
// const AWS = require("aws-sdk"); // Uncomment this when using AWS Secrets Manager

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const HARDCODED_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // ⚠️ Hardcoded token

// Function to generate a cryptographically secure session ID
function generateSessionId() {
  return crypto.randomBytes(16).toString("hex");
}

// Function to call a third-party API using the hardcoded JWT (Insecure)
async function callLLMApi(userEmail) {
  console.log(`🚨 Calling third-party API INSECURELY for ${userEmail}`);

  const response = await fetch("https://thirdparty.com/api/generate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HARDCODED_JWT}`, // ⚠️ Hardcoded JWT being used here
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

/* 
🟢 GOOD PRACTICE: Secure JWT Handling with AWS Secrets Manager (Uncomment to use!)
This approach securely retrieves the JWT from AWS Secrets Manager instead of hardcoding it.

const secretsManager = new AWS.SecretsManager({
  region: "us-east-1", // Change to your AWS region
});

// Function to retrieve JWT securely from AWS Secrets Manager
async function getJWTFromSecretsManager() {
  try {
    const secretData = await secretsManager
      .getSecretValue({ SecretId: "ThirdPartyAPIJWT" }) // Stored secret name
      .promise();

    if (secretData.SecretString) {
      const parsedSecret = JSON.parse(secretData.SecretString);
      return parsedSecret.JWT_TOKEN; // Assuming { "JWT_TOKEN": "actual_jwt_here" }
    }
  } catch (error) {
    console.error("Error retrieving JWT from Secrets Manager:", error);
    return null;
  }
}

// Function to call a third-party API securely using AWS Secrets Manager
async function callLLMApi(userEmail) {
  console.log(`🟢 Calling third-party API SECURELY for ${userEmail}`);

  const jwtToken = await getJWTFromSecretsManager();
  if (!jwtToken) {
    console.error("Failed to retrieve JWT from Secrets Manager.");
    return null;
  }

  const response = await fetch("https://thirdparty.com/api/generate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${jwtToken}`, // 🟢 Securely retrieved JWT
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
*/

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



