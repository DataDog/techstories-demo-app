from flask import Flask, request, render_template_string
from ddtrace.contrib.trace_utils import set_user
from ddtrace import tracer

app = Flask(__name__)

@app.route('/hello', methods=['GET'])
def hello():
    return "Hello, World!"

@app.route('/refer_friends', methods=['GET', 'POST'])
def refer_friends():
   
   # Get the email from the query parameter and use it as the user_id
    user_email = request.args.get('email')
    
    # In this application, we use the user_email as the user_id for demo purposes
    # In a production application, you should use a unique,immutable identifier for the user
    # The user_id value maps to the usr.id attribute in Datadog ASM
    # User blocking targets usr.id

    # set_user(tracer=tracer, user_id=user_email, propagate=True)

    if request.method == 'POST':
        user_email = request.form.get('email')
        referral_email = request.form.get('referral')

        # Add your blocking logic here
        if not referral_email.endswith('@example.com'):
            return render_template_string("""
                <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                            .container { max-width: 600px; margin: 50px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                            h1 { color: #333; }
                            p { color: #666; }
                            .error { color: red; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1 class="error">Invalid Email</h1>
                            <p>Referral email must end with @example.com.</p>
                        </div>
                    </body>
                </html>
            """)

        return render_template_string("""
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 50px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                        h1 { color: #333; }
                        p { color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Referral Sent!</h1>
                        <p>Your referral was sent to {{ referral_email }}</p>
                    </div>
                </body>
            </html>
        """, referral_email=referral_email)

    return render_template_string("""
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 50px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                    h1 { color: #333; }
                    p { color: #666; }
                    form { display: flex; flex-direction: column; }
                    label { margin-bottom: 5px; color: #333; }
                    input[type="email"] { padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 4px; }
                    button { padding: 10px; background-color: #007BFF; color: white; border: none; border-radius: 4px; cursor: pointer; }
                    button:hover { background-color: #0056b3; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Welcome, {{ user_email }}</h1>
                    <p>Invite a friend to join us by filling out the form below:</p>
                    <form method="POST">
                        <label for="referral">Who would you like to refer?</label>
                        <input type="email" name="referral" id="referral" required>
                        <button type="submit">Send Referral</button>
                    </form>
                </div>
            </body>
        </html>
    """, user_email=user_email)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3003)

