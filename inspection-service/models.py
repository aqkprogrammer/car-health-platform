"""
Pydantic models for request/response schemas.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, field_validator


class AnalysisRequest(BaseModel):
    """Request model for car inspection analysis."""
    
    jobId: str = Field(..., description="Unique job identifier")
    imageUrls: List[str] = Field(..., description="List of image URLs to analyze", min_length=1)
    audioUrl: Optional[str] = Field(None, description="Optional audio URL for engine analysis")
    
    @field_validator("imageUrls")
    @classmethod
    def validate_image_urls(cls, v: List[str]) -> List[str]:
        """Validate that image URLs list is not empty."""
        if not v:
            raise ValueError("At least one image URL is required")
        return v
    
    @field_validator("audioUrl")
    @classmethod
    def validate_audio_url(cls, v: Optional[str]) -> Optional[str]:
        """Validate audio URL format if provided."""
        if v is not None and not v.strip():
            return None
        return v


class AnalysisResponse(BaseModel):
    """Response model for car inspection analysis."""
    
    jobId: str = Field(..., description="Unique job identifier")
    exteriorScore: int = Field(..., ge=0, le=100, description="Exterior condition score (0-100)")
    engineScore: int = Field(..., ge=0, le=100, description="Engine condition score (0-100)")
    issues: List[str] = Field(default_factory=list, description="List of detected issues")
    raw: Dict[str, Any] = Field(..., description="Full mock AI output with detailed analysis")
