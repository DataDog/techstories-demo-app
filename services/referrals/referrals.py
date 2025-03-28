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
    cursor.execute(f"INSERT INTO referrals (email) VALUES ('{referral_email}')")  
    conn.commit()
    conn.close()
    return "Referral saved!"

@app.route('/call_referral_api', methods=['POST'])
def call_referral_api():
    referral_email = request.form.get('referral')
    response = requests.post(f"http://thirdparty.com/api/refer", data={"email": referral_email}) 
    return response.text

@app.route('/log_with_os', methods=['POST'])
def log_with_os():
    referral_email = request.form.get('referral')
    os.system(f'logger "Referral received: {referral_email}"') 

    return "Referral logged."

@app.route('/set_cookie', methods=['POST'])
def set_cookie():
    referral_email = request.form.get('referral')
    resp = make_response("Cookie set!")
    resp.set_cookie("referral_email", referral_email)  
    return resp

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3003)  


