const tracer = require("dd-trace").init();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// retrieve existing messages between two users
function getPrivateMessages(user1, user2) {
  // In prod, this will write to the database, in dev, we read from a JSON file
  const allMessages = JSON.parse(fs.readFileSync("demo_messages.json", "utf-8"));
  // Filter messages between user1 and user2
  return allMessages.filter(
    (msg) => (msg.sender === user1 && msg.receiver === user2) || 
             (msg.sender === user2 && msg.receiver === user1)
  );
}

// Add a new message to the database
function addPrivateMessage(sender, receiver, content) {
  const newMessage = {
    sender,
    receiver,
    content,
    timestamp: new Date().toISOString(),
  };
  const allMessages = JSON.parse(fs.readFileSync("demo_messages.json", "utf-8"));
  allMessages.push(newMessage);
  fs.writeFileSync("demo_messages.json", JSON.stringify(allMessages, null, 2));
  return newMessage;
}

// Route to get private messages between two users
app.post("/get_messages", (req, res) => {
  const { sessionId, user1, user2 } = req.body;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Both user1 and user2 are required" });
  }

  console.log(`Fetching messages between ${user1} and ${user2}`);

  const user = { id: user1, session_id: sessionId };

  const messages = getPrivateMessages(user1, user2);

  res.json({ messages });
});

// Route to send a new private message
app.post("/send_message", (req, res) => {
  const { sessionId, sender, receiver, content } = req.body;

  if (!sender || !receiver || !content) {
    return res.status(400).json({ error: "Sender, receiver, and content are required" });
  }

  console.log(`Sending message from ${sender} to ${receiver}`);

  const user = { id: sender, session_id: sessionId };
  
  tracer.setUser(user);
  const newMessage = addPrivateMessage(sender, receiver, content);

  // Track the message send event
  const eventName = "activity.use_message_tokens";
  tracer.appsec.trackCustomEvent(eventName);

  res.json({ message: newMessage });
});

app.listen(port, () => {
  console.log(`Private messaging service running on port ${port}`);
});



