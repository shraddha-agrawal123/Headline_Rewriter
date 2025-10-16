from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Hugging Face API configuration
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
# You can get a free token at: https://huggingface.co/settings/tokens

def rewrite_with_huggingface(text, style):
    """Rewrite headline using Hugging Face API"""
    
    # Use a more appropriate model for text generation
    API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
    # Create different prompts for each style
    style_prompts = {
        'formal': f"""Rewrite this headline in a formal, professional tone. Use sophisticated vocabulary and complete sentences.

Original: "AI is transforming businesses worldwide"
Formal: "Artificial Intelligence is revolutionizing global industries"

Original: "New study shows coffee is healthy"  
Formal: "Recent research indicates the beneficial properties of coffee consumption"

Now rewrite this headline in formal style:
Original: "{text}"
Formal:""",
        
        'casual': f"""Rewrite this headline in a casual, conversational tone. Use friendly language and feel free to use exclamation marks.

Original: "AI is transforming businesses worldwide"
Casual: "AI is changing the way businesses work everywhere!"

Original: "New study shows coffee is healthy"
Casual: "Turns out coffee is actually good for you!"

Now rewrite this headline in casual style:
Original: "{text}"
Casual:""",
        
        'concise': f"""Rewrite this headline in the most concise form possible. Use 3-5 words maximum. Remove all unnecessary words while keeping the core meaning.

Original: "AI is transforming businesses worldwide"
Concise: "AI transforms industries"

Original: "New study shows coffee is healthy"
Concise: "Coffee benefits confirmed"

Now rewrite this headline in concise style (3-5 words only):
Original: "{text}"
Concise:"""
    }
    
    payload = {
        "inputs": style_prompts[style],
        "parameters": {
            "max_new_tokens": 50,
            "temperature": 0.7,
            "do_sample": True,
            "return_full_text": False
        }
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get('generated_text', '').strip()
                # Clean up the response
                if generated_text:
                    # Remove any remaining prompt fragments
                    lines = generated_text.split('\n')
                    for line in lines:
                        if line and not line.startswith('Original:') and not line.startswith('Formal:') and not line.startswith('Casual:') and not line.startswith('Concise:'):
                            return line.strip()
                    return generated_text
                return "Unable to generate rewrite"
            else:
                raise Exception("No response generated")
                
        elif response.status_code == 503:
            # Model is loading, wait and retry
            time.sleep(10)
            return rewrite_with_huggingface(text, style)
        else:
            raise Exception(f"API request failed with status {response.status_code}: {response.text}")
            
    except Exception as e:
        raise Exception(f"Hugging Face API error: {str(e)}")

def rewrite_headline_huggingface(text, style):
    """Wrapper function with error handling"""
    try:
        return rewrite_with_huggingface(text, style)
    except Exception as e:
        # Fallback to simple rule-based rewriting if API fails
        return fallback_rewrite(text, style)

def fallback_rewrite(text, style):
    """Fallback rule-based rewriting if API fails"""
    words = text.split()
    key_phrase = ' '.join(words[:3]) if len(words) > 3 else text
    
    if style == 'formal':
        formal_options = [
            f"Comprehensive Analysis of {key_phrase}",
            f"Strategic Overview: {key_phrase} Developments",
            f"Professional Assessment of {key_phrase}",
            f"Formal Review: {key_phrase} Implications"
        ]
        return formal_options[hash(text) % len(formal_options)]
    
    elif style == 'casual':
        casual_options = [
            f"Hey! Check this out about {key_phrase}",
            f"Wow! {text} - pretty cool, right?",
            f"You'll never believe this: {key_phrase} update!",
            f"Quick news: {key_phrase} is making waves!"
        ]
        return casual_options[hash(text) % len(casual_options)]
    
    elif style == 'concise':
        concise_options = [
            f"{key_phrase} Update",
            f"{key_phrase} Developments", 
            f"{key_phrase} News",
            f"{key_phrase} Report"
        ]
        return concise_options[hash(text) % len(concise_options)]

@app.route('/')
def home():
    return jsonify({
        'message': 'Headline Rewriter API is running!',
        'provider': 'Hugging Face',
        'endpoints': {
            'health': '/api/health (GET)',
            'rewrite': '/api/rewrite (POST)'
        }
    })

@app.route('/api/rewrite', methods=['POST'])
def rewrite_headline():
    try:
        # Get input data
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text'].strip()
        
        # Validate input
        if len(text) < 5:
            return jsonify({
                'success': False,
                'error': 'Text must be at least 5 characters long'
            }), 400
        
        if len(text) > 500:
            return jsonify({
                'success': False,
                'error': 'Text must be less than 500 characters'
            }), 400
        
        # Generate all three versions using Hugging Face
        formal_result = rewrite_headline_huggingface(text, 'formal')
        casual_result = rewrite_headline_huggingface(text, 'casual') 
        concise_result = rewrite_headline_huggingface(text, 'concise')
        
        # Return results
        return jsonify({
            'success': True,
            'original': text,
            'results': {
                'formal': formal_result,
                'casual': casual_result,
                'concise': concise_result
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Headline Rewriter API is running with Hugging Face',
        'provider': 'Hugging Face'
    })

if __name__ == '__main__':
    # Check if Hugging Face API key is set
    if not HUGGINGFACE_API_KEY:
        print("WARNING: HUGGINGFACE_API_KEY not found in environment variables!")
        print("Please create a .env file with your Hugging Face API token")
        print("You can get a free token from: https://huggingface.co/settings/tokens")
        print("Running in fallback mode (rule-based rewriting only)")
    else:
        print("Hugging Face API key found!")
    
    print("Starting Flask server on http://localhost:5000")
    print("Available endpoints:")
    print("  GET  http://localhost:5000/")
    print("  GET  http://localhost:5000/api/health") 
    print("  POST http://localhost:5000/api/rewrite")
    
    app.run(debug=True, host='0.0.0.0', port=5000)