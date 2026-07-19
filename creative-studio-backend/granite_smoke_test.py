"""Live smoke test — makes a real IBM Granite API call. Requires valid .env credentials."""
import asyncio
import json
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

# Auto-correct dashboard URL to API endpoint
if "dataplatform" in os.environ.get("WATSONX_URL", "") or "ml.cloud.ibm.com" not in os.environ.get("WATSONX_URL", ""):
    os.environ["WATSONX_URL"] = "https://us-south.ml.cloud.ibm.com"
    print("Note: Auto-corrected WATSONX_URL to https://us-south.ml.cloud.ibm.com\n")

# Use the correct model available on this account
os.environ["WATSONX_MODEL_ID"] = "ibm/granite-4-h-small"

import app.services.granite_client as gc
gc._model = None  # reset singleton

from app.services.granite_client import generate, GraniteResponseError


async def main():
    print("Calling IBM Granite (live)...")
    print(f"Model  : {os.environ.get('WATSONX_MODEL_ID')}")
    print(f"URL    : {os.environ.get('WATSONX_URL')}")
    print(f"Project: {os.environ.get('WATSONX_PROJECT_ID')}\n")

    prompt = (
        'You are a creative director. Analyse this idea: '
        '"A mobile app that helps people find local hiking trails with AI-powered difficulty ratings."\n\n'
        'Respond with ONLY a valid JSON object, no other text:\n'
        '{"originality_score": <integer 1-10>, "emotional_direction": "<string>", '
        '"key_themes": ["<theme>"], "ai_engine": "IBM Granite"}'
    )
    try:
        response = await generate(prompt=prompt)
        print(f"Status      : SUCCESS")
        print(f"AI Engine   : {response.ai_engine}")
        print(f"Fallback    : {response.fallback_used}")
        print(f"Raw length  : {len(response.raw)} chars")
        parsed = json.loads(response.content)
        print(f"Parsed JSON :\n{json.dumps(parsed, indent=2)}")
    except GraniteResponseError as e:
        print(f"Status      : FAILED - {e}")
        print(f"Raw output  : {e.raw[:300]}")

asyncio.run(main())
