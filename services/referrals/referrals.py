from flask import Flask, request, jsonify
import boto3
from botocore.exceptions import ClientError
from datetime import datetime

app = Flask(__name__)

# Initialize DynamoDB tables
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
referrers_table = dynamodb.Table("techstories-referral-users")
referrals_table = dynamodb.Table("techstories-referral-records")

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
    - Stores the referral in DynamoDB
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
        existing = referrals_table.get_item(
            Key={
                "referrer_email": referrer_email,
                "referee_email": referee_email
            }
        )
        if "Item" in existing:
            return jsonify({"error": "You’ve already referred this person."}), 409

        # Store the referral record
        referrals_table.put_item(Item={
            "referrer_email": referrer_email,
            "referee_email": referee_email,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Add 10 points to the referrer's point total
        referrers_table.update_item(
            Key={"email": referrer_email},
            UpdateExpression="SET points = if_not_exists(points, :zero) + :inc",
            ExpressionAttributeValues={
                ":inc": 10,
                ":zero": 0
            }
        )

        # Get the updated point total
        updated = referrers_table.get_item(Key={"email": referrer_email})
        points = updated.get("Item", {}).get("points", 0)

        return jsonify({
            "message": f"Referral to {referee_email} recorded.",
            "points": points
        }), 200

    except ClientError as e:
        app.logger.error(f"DynamoDB error: {e}")
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
        response = referrals_table.query(
            KeyConditionExpression=Key("referrer_email").eq(referrer_email),
            Limit=5,  # optional: limit to most recent 5
            ScanIndexForward=False  # optional: sort descending by sort key (if timestamp used)
        )
        return jsonify({ "referrals": response.get("Items", []) }), 200

    except ClientError as e:
        app.logger.error(f"Error fetching referral history: {e}")
        return jsonify({ "error": "Failed to fetch referral history" }), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3003)