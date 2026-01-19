# Car Inspection Analysis Service

A stateless FastAPI service that performs AI-powered car inspection analysis on images and audio.

## Features

- **POST /analyze** - Analyze car inspection data (images and optional audio)
- Stateless design - no database required
- Async/await for efficient I/O operations
- Comprehensive error handling and logging
- Request timeout enforcement
- Download failure handling

## Requirements

- Python 3.9+
- See `requirements.txt` for dependencies

## Installation

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Service

### Using Docker Compose (Recommended)

The service is included in the project's docker-compose setup:

```bash
# From project root - Production
docker-compose up inspection-service

# Development (with hot-reload)
docker-compose -f docker-compose.dev.yml up inspection-service

# Or run all services together
docker-compose up
```

### Local Development

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker Only

If you want to run just this service with Docker:

```bash
# Build the image
docker build -t inspection-service .

# Run the container
docker run -p 8000:8000 inspection-service
```

## API Endpoints

### POST /analyze

Analyze car inspection data.

**Request Body:**
```json
{
  "jobId": "job-123",
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "audioUrl": "https://example.com/engine-sound.mp3"
}
```

**Response:**
```json
{
  "jobId": "job-123",
  "exteriorScore": 85,
  "engineScore": 78,
  "issues": [
    "Minor scratches on front bumper",
    "Rough idle detected"
  ],
  "raw": {
    "exterior_analysis": { ... },
    "engine_analysis": { ... },
    "metadata": { ... }
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "car-inspection-analysis"
}
```

## API Documentation

Once the service is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Configuration

The service uses the following default settings:
- Request timeout: 30 seconds
- File download timeout: 10 seconds
- Max file size: 50MB

These can be modified in `service.py` if needed.

## Error Handling

The service handles:
- Download failures (continues with available data)
- Timeout errors (returns 504)
- Invalid requests (returns 400)
- Server errors (returns 500)

## Logging

Logs are output to stdout with the following format:
```
YYYY-MM-DD HH:MM:SS - logger_name - LEVEL - message
```

Log levels:
- INFO: Normal operations
- WARNING: Non-critical issues (e.g., failed downloads)
- ERROR: Critical errors

## Development

### Project Structure

```
inspection-service/
├── main.py           # FastAPI application and endpoints
├── models.py         # Pydantic request/response models
├── service.py        # Business logic and analysis simulation
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

## Notes

- This is a **simulation service** - it generates mock analysis results
- No authentication is implemented (add as needed for production)
- No database is used (stateless design)
- Images and audio are downloaded but not stored permanently
