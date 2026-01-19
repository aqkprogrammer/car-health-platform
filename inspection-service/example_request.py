"""
Example script to test the inspection service.
Run this after starting the FastAPI server.
"""

import requests
import json

# Service URL
BASE_URL = "http://localhost:8000"

# Example request payload
payload = {
    "jobId": "test-job-123",
    "imageUrls": [
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70"
    ],
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
}

def test_analyze():
    """Test the /analyze endpoint."""
    print("Testing /analyze endpoint...")
    print(f"Request payload: {json.dumps(payload, indent=2)}")
    print()
    
    try:
        response = requests.post(
            f"{BASE_URL}/analyze",
            json=payload,
            timeout=35
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

def test_health():
    """Test the /health endpoint."""
    print("Testing /health endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("=" * 50)
    test_health()
    print()
    print("=" * 50)
    test_analyze()
    print("=" * 50)
