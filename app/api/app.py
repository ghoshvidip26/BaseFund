from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai.types import GenerateContentConfig, Modality
from PIL import Image
from io import BytesIO
import base64
import os
import collections
from collections.abc import Callable
collections.Callable = collections.abc.Callable
collections.Iterable = collections.abc.Iterable

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

def make_visual_prompt(user_description: str) -> str:
    return (
        f"Create a visually appealing and professional app logo concept based on the following idea:\n\n"
        f"'{user_description}'\n\n"
        "Use a clean, minimal, modern style."
    )

@app.route('/generate', methods=['POST'])
def generate_image():
    try:
        data = request.get_json()
        user_description = data.get('description')
        if not user_description:
            return jsonify({"error": "Missing 'description'"}), 400

        prompt = make_visual_prompt(user_description)

        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=(prompt,),
            config=GenerateContentConfig(
                response_modalities=[Modality.TEXT, Modality.IMAGE]
            ),
        )

        image_base64 = None
        for part in response.candidates[0].content.parts:
            if hasattr(part, "inline_data") and part.inline_data:
                image_base64 = part.inline_data.data  # This is already base64 string
                # Save locally (optional)
                try:
                    image_bytes = base64.b64decode(image_base64)
                    image = Image.open(BytesIO(image_bytes))
                    image.save("gemini-logo.png")
                    print("Image saved as gemini-logo.png")
                except Exception as e:
                    print(f"Error saving image: {e}")
                break

        if not image_base64:
            return jsonify({"error": "No image found in response"}), 500

        return jsonify({
            "message": "Image generation successful",
            "base64": image_base64,  # Send as string
            "prompt": prompt
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)
