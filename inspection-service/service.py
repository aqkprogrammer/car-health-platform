"""
Inspection service for downloading and analyzing car inspection data.
"""

import logging
import asyncio
import aiohttp
import time
from typing import List, Optional, Dict, Any
import random

from models import AnalysisRequest, AnalysisResponse

logger = logging.getLogger(__name__)


class InspectionService:
    """Service for car inspection analysis."""
    
    def __init__(self):
        """Initialize the inspection service."""
        self.timeout = aiohttp.ClientTimeout(total=10, connect=5)
        self.max_file_size = 50 * 1024 * 1024  # 50MB max file size
    
    async def download_file(
        self,
        session: aiohttp.ClientSession,
        url: str,
        file_type: str = "image"
    ) -> Optional[bytes]:
        """
        Download a file from a URL.
        
        Args:
            session: aiohttp session
            url: URL to download from
            file_type: Type of file ("image" or "audio")
            
        Returns:
            File content as bytes, or None if download failed
        """
        # Try to rewrite localhost URLs to use Docker service name
        rewritten_url = self._rewrite_localhost_url(url)
        if rewritten_url != url:
            logger.info(f"Rewritten URL from {url} to {rewritten_url}")
        
        try:
            logger.info(f"Downloading {file_type} from: {rewritten_url}")
            
            async with session.get(rewritten_url, timeout=self.timeout) as response:
                if response.status != 200:
                    error_text = await response.text() if response.content_length else "No error details"
                    logger.warning(
                        f"Failed to download {file_type} from {rewritten_url}: "
                        f"HTTP {response.status} - {error_text[:200]}"
                    )
                    return None
                
                # Check content length
                content_length = response.headers.get('Content-Length')
                if content_length and int(content_length) > self.max_file_size:
                    logger.warning(f"File too large: {content_length} bytes")
                    return None
                
                content = await response.read()
                
                # Verify file size after download
                if len(content) > self.max_file_size:
                    logger.warning(f"Downloaded file exceeds size limit: {len(content)} bytes")
                    return None
                
                logger.info(f"Successfully downloaded {file_type}: {len(content)} bytes")
                return content
                
        except asyncio.TimeoutError:
            logger.error(f"Timeout downloading {file_type} from: {rewritten_url}")
            return None
        except aiohttp.ClientError as e:
            logger.error(f"Client error downloading {file_type} from {rewritten_url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error downloading {file_type} from {rewritten_url}: {e}", exc_info=True)
            return None
    
    def _rewrite_localhost_url(self, url: str) -> str:
        """
        Rewrite localhost URLs to use Docker service name for internal access.
        
        Args:
            url: Original URL
            
        Returns:
            Rewritten URL if applicable, otherwise original URL
        """
        import os
        backend_host = os.getenv('BACKEND_HOST', 'backend')
        
        # Replace localhost:3001 with backend:3001 for Docker networking
        if 'localhost:3001' in url or '127.0.0.1:3001' in url:
            rewritten = url.replace('localhost:3001', f'{backend_host}:3001')
            rewritten = rewritten.replace('127.0.0.1:3001', f'{backend_host}:3001')
            return rewritten
        
        return url
    
    async def download_images(self, image_urls: List[str]) -> List[bytes]:
        """
        Download all images from URLs.
        
        Args:
            image_urls: List of image URLs
            
        Returns:
            List of image data as bytes
        """
        async with aiohttp.ClientSession() as session:
            tasks = [
                self.download_file(session, url, "image")
                for url in image_urls
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            images = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Error downloading image {i+1}: {result}")
                elif result is not None:
                    images.append(result)
                else:
                    logger.warning(f"Failed to download image {i+1} from {image_urls[i]}")
            
            return images
    
    async def download_audio(self, audio_url: Optional[str]) -> Optional[bytes]:
        """
        Download audio file from URL.
        
        Args:
            audio_url: Audio URL (can be None)
            
        Returns:
            Audio data as bytes, or None
        """
        if not audio_url:
            return None
        
        async with aiohttp.ClientSession() as session:
            return await self.download_file(session, audio_url, "audio")
    
    def simulate_exterior_analysis(self, images: List[bytes]) -> Dict[str, Any]:
        """
        Simulate exterior analysis based on downloaded images.
        
        Args:
            images: List of image data
            
        Returns:
            Dictionary with exterior analysis results
        """
        logger.info(f"Simulating exterior analysis for {len(images)} images")
        
        # Simulate analysis based on number of images and random factors
        num_images = len(images)
        
        # Base score calculation (simulated)
        base_score = 75
        score_variation = random.randint(-20, 25)
        exterior_score = max(0, min(100, base_score + score_variation))
        
        # Simulate detected issues
        potential_issues = [
            "Minor scratches on front bumper",
            "Paint chips on hood",
            "Dent on driver side door",
            "Rust spots on wheel wells",
            "Cracked windshield",
            "Faded paint on roof",
            "Scratches on rear bumper",
            "Missing side mirror cover",
            "Dented fender",
            "Paint mismatch on panel"
        ]
        
        # Randomly select 0-3 issues
        num_issues = random.randint(0, min(3, len(potential_issues)))
        detected_issues = random.sample(potential_issues, num_issues) if num_issues > 0 else []
        
        # Simulate detailed analysis
        analysis_details = {
            "images_analyzed": num_images,
            "detected_components": [
                "Front bumper",
                "Hood",
                "Doors",
                "Windows",
                "Wheels",
                "Lights"
            ],
            "condition_assessment": {
                "overall": "good" if exterior_score >= 70 else "fair" if exterior_score >= 50 else "poor",
                "paint_quality": random.choice(["excellent", "good", "fair", "poor"]),
                "body_damage": "minimal" if exterior_score >= 80 else "moderate" if exterior_score >= 60 else "significant"
            },
            "confidence": random.uniform(0.85, 0.98)
        }
        
        return {
            "score": exterior_score,
            "issues": detected_issues,
            "details": analysis_details
        }
    
    def simulate_engine_analysis(self, audio_data: Optional[bytes]) -> Dict[str, Any]:
        """
        Simulate engine sound analysis based on audio data.
        
        Args:
            audio_data: Audio file data (can be None)
            
        Returns:
            Dictionary with engine analysis results
        """
        if audio_data is None:
            logger.info("No audio provided, simulating engine analysis without audio")
            # Lower score and add note when no audio
            base_score = 60
            score_variation = random.randint(-15, 15)
            engine_score = max(0, min(100, base_score + score_variation))
            
            return {
                "score": engine_score,
                "issues": ["Audio analysis not available - visual inspection only"],
                "details": {
                    "audio_provided": False,
                    "analysis_method": "visual_inspection_only",
                    "confidence": random.uniform(0.60, 0.75)
                }
            }
        
        logger.info(f"Simulating engine analysis for audio: {len(audio_data)} bytes")
        
        # Simulate analysis based on audio data
        base_score = 70
        score_variation = random.randint(-25, 20)
        engine_score = max(0, min(100, base_score + score_variation))
        
        # Simulate detected issues
        potential_issues = [
            "Unusual knocking sound detected",
            "Rough idle detected",
            "Timing belt noise",
            "Exhaust leak suspected",
            "Engine misfire detected",
            "Belt squealing",
            "Low oil pressure warning",
            "Cooling system noise",
            "Transmission whine",
            "Engine mount wear"
        ]
        
        # Randomly select 0-2 issues
        num_issues = random.randint(0, min(2, len(potential_issues)))
        detected_issues = random.sample(potential_issues, num_issues) if num_issues > 0 else []
        
        # Simulate detailed analysis
        analysis_details = {
            "audio_provided": True,
            "audio_duration_seconds": random.uniform(5.0, 30.0),
            "frequency_analysis": {
                "dominant_frequency_hz": random.uniform(50, 200),
                "harmonics_detected": random.randint(2, 5),
                "noise_level": random.choice(["low", "moderate", "high"])
            },
            "condition_assessment": {
                "overall": "good" if engine_score >= 70 else "fair" if engine_score >= 50 else "poor",
                "idle_quality": random.choice(["smooth", "slightly_rough", "rough"]),
                "acceleration_response": random.choice(["excellent", "good", "fair", "poor"])
            },
            "confidence": random.uniform(0.80, 0.95)
        }
        
        return {
            "score": engine_score,
            "issues": detected_issues,
            "details": analysis_details
        }
    
    async def analyze(self, request: AnalysisRequest) -> AnalysisResponse:
        """
        Main analysis method that orchestrates the entire process.
        
        Args:
            request: Analysis request with jobId, imageUrls, and audioUrl
            
        Returns:
            AnalysisResponse with scores, issues, and raw data
        """
        logger.info(f"Starting analysis for jobId: {request.jobId}")
        
        # Download images and audio concurrently
        download_tasks = [
            self.download_images(request.imageUrls),
            self.download_audio(request.audioUrl)
        ]
        
        images, audio_data = await asyncio.gather(*download_tasks)
        
        # Validate that we got at least some images
        if not images:
            logger.error(
                f"Failed to download any images from {len(request.imageUrls)} URLs. "
                f"URLs attempted: {request.imageUrls}"
            )
            raise ValueError(
                f"Failed to download any images from {len(request.imageUrls)} URLs. "
                "Please check that the URLs are accessible and the backend service is reachable."
            )
        
        logger.info(f"Downloaded {len(images)} images and {'audio' if audio_data else 'no audio'}")
        
        # Perform analysis (simulated)
        exterior_analysis = self.simulate_exterior_analysis(images)
        engine_analysis = self.simulate_engine_analysis(audio_data)
        
        # Combine all issues
        all_issues = exterior_analysis["issues"] + engine_analysis["issues"]
        
        # Build raw output
        raw_output = {
            "exterior_analysis": exterior_analysis,
            "engine_analysis": engine_analysis,
            "metadata": {
                "job_id": request.jobId,
                "images_processed": len(images),
                "audio_processed": audio_data is not None,
                "analysis_timestamp": time.time()
            }
        }
        
        # Build response
        response = AnalysisResponse(
            jobId=request.jobId,
            exteriorScore=exterior_analysis["score"],
            engineScore=engine_analysis["score"],
            issues=all_issues,
            raw=raw_output
        )
        
        logger.info(
            f"Analysis complete for jobId: {request.jobId} - "
            f"Exterior: {response.exteriorScore}, Engine: {response.engineScore}, "
            f"Issues: {len(response.issues)}"
        )
        
        return response
