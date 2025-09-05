from flask import Flask, request, jsonify
from google.cloud import firestore
from google.cloud.exceptions import GoogleCloudError
from datetime import datetime
import os

app = Flask(__name__)

# Initialize Firestore client with configurable database and collections
firestore_database = os.environ.get('FIRESTORE_DATABASE', 'techstories-referrals-db')
referrers_collection_name = os.environ.get('REFERRERS_COLLECTION', 'referral_users')
referrals_collection_name = os.environ.get('REFERRALS_COLLECTION', 'referral_records')

db = firestore.Client(database=firestore_database)
referrers_collection = db.collection(referrers_collection_name)
referrals_collection = db.collection(referrals_collection_name)

def validate_input(email: str) -> bool:
    """
    Validates that the given email is a non-empty string that ends with '@example.com'.
    """
    if not email or not isinstance(email, str):
        return False
    if "@" not in email or "." not in email:
        return False
    if not email.endswith("@example.com"):
        return False
    return True

@app.route('/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint for use by load balancers and uptime monitors.
    Returns 200 OK if the service is up.
    """
    return jsonify({"status": "ok"}), 200

@app.route('/refer_friends', methods=['POST'])
def refer_friends():
    """
    Accepts a referral submission:
    - Checks for valid referrer and referee email
    - Prevents duplicate referrals from the same referrer
    - Stores the referral in Firestore
    - Increments the referrer's point total by 10
    """
    data = request.get_json()
    referrer_email = data.get("email")
    referee_email = data.get("referral")

    # Validate input presence
    if not referrer_email or not referee_email:
        return jsonify({"error": "Missing referrer or referral email"}), 400

    # Validate referee email format and domain
    if not validate_input(referee_email):
        return jsonify({"error": "Invalid referral email address"}), 400

    try:
        # Check if this referrer has already referred this referee
        existing_refs = referrals_collection.where('referrer_email', '==', referrer_email).where('referee_email', '==', referee_email).limit(1).stream()
        if any(existing_refs):
            return jsonify({"error": "You've already referred this person."}), 409

        # Store the referral record
        referrals_collection.add({
            "referrer_email": referrer_email,
            "referee_email": referee_email,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Add 10 points to the referrer's point total
        referrer_doc = referrers_collection.document(referrer_email)
        referrer_data = referrer_doc.get()
        
        if referrer_data.exists:
            current_points = referrer_data.to_dict().get('points', 0)
            new_points = current_points + 10
            referrer_doc.update({'points': new_points})
        else:
            new_points = 10
            referrer_doc.set({'points': new_points})

        return jsonify({
            "message": f"Referral to {referee_email} recorded.",
            "points": new_points
        }), 200

    except GoogleCloudError as e:
        app.logger.error(f"Firestore error: {e}")
        return jsonify({"error": "Referral failed. Try again later."}), 500

@app.route('/referrals/history', methods=['GET'])
def get_referral_history():
    """
    Returns a list of referee emails previously referred by a given referrer.
    Requires ?email=referrer_email query param.
    """
    referrer_email = request.args.get("email")
    if not referrer_email:
        return jsonify({ "error": "Missing email parameter" }), 400

    try:
        # Query referrals for this referrer, ordered by timestamp (newest first), limit to 5
        referral_docs = referrals_collection.where('referrer_email', '==', referrer_email).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(5).stream()
        referrals_list = [doc.to_dict() for doc in referral_docs]
        return jsonify({ "referrals": referrals_list }), 200

    except GoogleCloudError as e:
        app.logger.error(f"Error fetching referral history: {e}")
        return jsonify({ "error": "Failed to fetch referral history" }), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3003)