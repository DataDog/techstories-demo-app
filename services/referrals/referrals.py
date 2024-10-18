from flask import Flask, request, render_template_string

app = Flask(__name__)

@app.route('/refer_friends', methods=['GET', 'POST'])
def refer_friends():
    # Check the 'Accept' header to see if the client expects HTML
    if "text/html" in request.headers.get("Accept", ""):
        print("Client expects HTML content")

    if request.method == 'POST':
        user_email = request.form.get('email')
        referral_email = request.form.get('referral')

        # Add your blocking logic here
        if not referral_email.endswith('@example.com'):
            return render_template_string("""
                <html>
                    <body>
                        <h1>Invalid Email</h1>
                        <p>Referral email must end with @example.com.</p>
                    </body>
                </html>
            """)

        return render_template_string("""
            <html>
                <body>
                    <h1>Referral Sent!</h1>
                    <p>Your referral was sent to {{ referral_email }}</p>
                </body>
            </html>
        """, referral_email=referral_email)

    return render_template_string("""
        <html>
            <body>
                <h1>Refer a Friend</h1>
                <form method="POST">
                    <label>Your Email:</label><br>
                    <input type="email" name="email" required><br><br>
                    <label>Friend's Email:</label><br>
                    <input type="email" name="referral" required><br><br>
                    <button type="submit">Send Referral</button>
                </form>
            </body>
        </html>
    """)

if __name__ == '__main__':
    app.run(debug=True)

