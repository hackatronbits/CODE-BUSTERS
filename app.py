from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)

OPENROUTER_API_KEY = "api key should be here"

@app.route('/ask', methods=['POST'])
def ask_openrouter():
    user_input = request.json.get('prompt', '')
    
    if not user_input:
        return jsonify({"error": "No prompt provided"}), 400

    payload = {
        "model": "deepseek/deepseek-r1:free",
        "messages": [
            {"role": "user", "content": user_input}
        ]
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "MyLocalTestApp"
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload),
            timeout=30  # Added timeout for safety
        )
        response.raise_for_status()  # Raise exception for HTTP errors
        
        reply = response.json()['choices'][0]['message']['content']
        return jsonify({"reply": reply})
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API request failed: {str(e)}"}), 500
    except KeyError:
        return jsonify({"error": "Unexpected response format from API"}), 500

@app.route('/')
def index():
    # Specify encoding to handle UTF-8 characters
    return open('index.html', encoding='utf-8').read()

if __name__ == '__main__':
    app.run(debug=True)