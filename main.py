from flask import Flask, render_template, request, jsonify
import os
import trafilatura
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Function to get website content
def get_website_text_content(url):
    """
    This function takes a url and returns the main text content of the website.
    The text content is extracted using trafilatura and easier to understand.
    """
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            text = trafilatura.extract(downloaded)
            return text
        return "Could not download the content."
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/docs/intro/')
def intro():
    return render_template('intro.html')

@app.route('/docs/usage/')
def usage():
    return render_template('usage.html')

@app.route('/docs/reference/')
def reference():
    return render_template('reference.html')

@app.route('/docs/events/')
def events():
    return render_template('events.html')

@app.route('/docs/types/')
def types():
    return render_template('types.html')

@app.route('/docs/auth/')
def auth():
    return render_template('auth.html')

@app.route('/api/fetch-content', methods=['POST'])
def fetch_content():
    data = request.json
    url = data.get('url', '')
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    content = get_website_text_content(url)
    return jsonify({"content": content})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)