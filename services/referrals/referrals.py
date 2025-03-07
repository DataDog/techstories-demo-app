import os
import secrets
from urllib.request import urlopen
import sqlite3
import requests
from flask import Flask, request, make_response, render_template_string

app = Flask(__name__)

@app.route('/hello', methods=['GET'])
def hello():
    return "Hello, World!"

@app.route('/save_referral', methods=['POST'])
def save_referral():
    referral_email = request.form.get('referral')
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(f"INSERT INTO referrals (email) VALUES ('{referral_email}')")  # ❌ SQL Injection risk
    conn.commit()
    conn.close()
    return "Referral saved!"

"""
# ✅ Secure Fix: Use parameterized queries
@app.route('/save_referral', methods=['POST'])
def save_referral():
    referral_email = request.form.get('referral')
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO referrals (email) VALUES (?)", (referral_email,))  # ✅ Uses parameterized queries
    conn.commit()
    conn.close()
    return "Referral saved securely!"
"""

@app.route('/call_referral_api', methods=['POST'])
def call_referral_api():
    referral_email = request.form.get('referral')
    response = requests.post(f"http://thirdparty.com/api/refer", data={"email": referral_email})  # ❌ Insecure HTTP
    return response.text

"""
# ✅ Secure Fix: Use HTTPS and timeout
@app.route('/call_referral_api', methods=['POST'])
def call_referral_api():
    referral_email = request.form.get('referral')
    response = requests.post("https://thirdparty.com/api/refer", data={"email": referral_email}, timeout=5)  # ✅ Secure HTTPS
    return response.text
"""

@app.route('/log_with_os', methods=['POST'])
def log_with_os():
    referral_email = request.form.get('referral')
    os.system(f'logger "Referral received: {referral_email}"') 

    return "Referral logged."

"""
# ✅ Secure Fix: Use Python’s built-in file operations instead of `os.system`
@app.route('/log_with_os', methods=['POST'])
def log_with_os():
    referral_email = request.form.get('referral')
    with open("referrals.log", "a") as f:
        f.write(f"Referral: {referral_email}\n")  # ✅ Secure logging
    return "Logged securely!"
"""

@app.route('/set_cookie', methods=['POST'])
def set_cookie():
    referral_email = request.form.get('referral')
    resp = make_response("Cookie set!")
    resp.set_cookie("referral_email", referral_email)  
    return resp

"""
# ✅ Secure Fix: Use `httponly` and `secure` flags
@app.route('/set_cookie', methods=['POST'])
def set_cookie():
    referral_email = request.form.get('referral')
    resp = make_response("Cookie set securely!")
    resp.set_cookie("referral_email", referral_email, httponly=True, secure=True)  # ✅ Secure cookie attributes
    return resp
"""

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3003)  
"""
# ✅ Secure Fix: Bind to localhost instead of all interfaces
if __name__ == '__main__':
    app.run(host="127.0.0.1", port=3003)  # ✅ Restricts access to local machine only
"""


