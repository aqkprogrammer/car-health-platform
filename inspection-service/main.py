"""
FastAPI service for car inspection analysis.
Stateless AI executor that analyzes car images and audio.
"""

import logging
import asyncio
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from models import AnalysisRequest, AnalysisResponse
from service import InspectionService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize service
inspection_service = InspectionService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events."""
    logger.info("Starting inspection service...")
    yield
    logger.info("Shutting down inspection service...")


# Create FastAPI app
app = FastAPI(
    title="Car Inspection Analysis Service",
    description="Stateless AI executor for car inspection analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc)
        }
    )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "car-inspection-analysis"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    """
    Analyze car inspection data.
    
    Downloads images and audio from provided URLs, then simulates
    exterior and engine analysis.
    """
    logger.info(f"Received analysis request for jobId: {request.jobId}")
    
    try:
        # Set timeout for the entire operation (30 seconds)
        result = await asyncio.wait_for(
            inspection_service.analyze(request),
            timeout=30.0
        )
        
        logger.info(f"Analysis completed for jobId: {request.jobId}")
        return result
        
    except asyncio.TimeoutError:
        logger.error(f"Request timeout for jobId: {request.jobId}")
        raise HTTPException(
            status_code=504,
            detail="Request timeout. Analysis took too long."
        )
    except ValueError as e:
        logger.error(f"Validation error for jobId: {request.jobId}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed for jobId: {request.jobId}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
