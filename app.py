from flask import Flask, request, render_template, jsonify
import requests

app = Flask(__name__)

# Replace with your actual Fast2SMS API key
FAST2SMS_API_KEY = "LWNetXsDHcuQISTOdr8YblZRAEzF3KnfpJ6kgjaxBqo9mwvPMhR5XyqnQhPOYSbxWm4pTwef2d3jJUuv"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/send-sms", methods=["POST"])
def send_sms():
    number = request.form.get("number")
    message = request.form.get("message")

    url = "https://www.fast2sms.com/dev/bulkV2"  # Updated endpoint

    payload = {
        'sender_id': 'FSTSMS',
        'message': message,
        'language': 'english',
        'route': 'q',  # Use 'q' for transactional (instant delivery), 'p' for promotional
        'numbers': number
    }

    headers = {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': "application/x-www-form-urlencoded"
    }

    response = requests.post(url, data=payload, headers=headers)

    if response.status_code == 200:
        return "✅ SMS sent successfully!"
    else:
        return f"❌ Failed to send SMS.<br>Status code: {response.status_code}<br>Response: {response.text}"

if __name__ == "__main__":
    app.run(debug=True)
