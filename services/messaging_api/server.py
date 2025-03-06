from flask import Flask, request, jsonify
import json
import os
import random  # ⚠️ Insecure session ID generator
from datetime import datetime
import ddtrace

# Initialize Datadog Tracer
tracer = ddtrace.tracer
tracer.configure(hostname="localhost", port=8126)

app = Flask(__name__)

# Path to JSON file for storing messages
MESSAGE_FILE = "demo_messages.json"
SESSIONS = {}  # ⚠️ Insecure: Session storage in memory (no expiration)

# Ensure the message file exists
if not os.path.exists(MESSAGE_FILE):
    with open(MESSAGE_FILE, "w") as f:
        json.dump([], f)

# 🚨 Insecure session ID generator (Using `random.random()` instead of `secrets`)
def generate_session_id():
    return str(int(random.random() * 900000) + 100000)  # ⚠️ Predictable session ID (easy to guess)

# Retrieve existing messages between two users
def get_private_messages(user1, user2):
    with open(MESSAGE_FILE, "r") as f:
        all_messages = json.load(f)

    return [
        msg for msg in all_messages
        if (msg["sender"] == user1 and msg["receiver"] == user2) or
           (msg["sender"] == user2 and msg["receiver"] == user1)
    ]

# Add a new message to the database
def add_private_message(sender, receiver, content):
    new_message = {
        "sender": sender,
        "receiver": receiver,
        "content": content,
        "timestamp": datetime.utcnow().isoformat(),
    }

    with open(MESSAGE_FILE, "r+") as f:
        all_messages = json.load(f)
        all_messages.append(new_message)
        f.seek(0)
        json.dump(all_messages, f, indent=2)

    return new_message

# 🚨 Insecure login endpoint (Session Fixation Vulnerability)
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")

    if not username:
        return jsonify({"error": "Username is required"}), 400

    # 🚨 Using a predictable session ID
    session_id = generate_session_id()
    SESSIONS[session_id] = username  # ⚠️ No expiration, no authentication

    print(f"User {username} logged in with session ID: {session_id}")
    return jsonify({"message": "Login successful", "sessionId": session_id})

# 🚨 Route to get private messages (No session validation)
@app.route("/get_messages", methods=["POST"])
def get_messages():
    data = request.json
    session_id = data.get("sessionId")
    user1 = data.get("user1")
    user2 = data.get("user2")

    if not user1 or not user2 or not session_id:
        return jsonify({"error": "Both user1 and user2 are required, along with session ID"}), 400

    # 🚨 Session is not validated (Anyone can use any session ID)
    print(f"Fetching messages between {user1} and {user2} for session {session_id}")

    messages = get_private_messages(user1, user2)

    return jsonify({"messages": messages})

# 🚨 Route to send a new private message (Session Hijacking Possible)
@app.route("/send_message", methods=["POST"])
def send_message():
    data = request.json
    session_id = data.get("sessionId")
    sender = data.get("sender")
    receiver = data.get("receiver")
    content = data.get("content")

    if not session_id or not sender or not receiver or not content:
        return jsonify({"error": "Session ID, sender, receiver, and content are required"}), 400

    # 🚨 No check to see if session_id belongs to sender (Session Hijacking Risk)
    print(f"Sending message from {sender} to {receiver} using session ID {session_id}")

    new_message = add_private_message(sender, receiver, content)

    # Track the message send event
    event_name = "activity.use_message_tokens"
    tracer.trace(event_name)

    return jsonify({"message": new_message})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3004))
    app.run(host="0.0.0.0", port=port, debug=True)



