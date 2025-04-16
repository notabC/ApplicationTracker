from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import logging
from typing import Dict, List, Any, Optional
import json
import asyncio

from ..models.ost_application import (
    ApplicationData,
    ApplicationProcessRequest,
    ApplicationAnalysisResult,
    JobOffer,
    JobQualityAssessment,
    WebSocketMessage
)
from ..services.ost_application_service import OSTApplicationService

# Setup logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Create service instance
app_service = OSTApplicationService()

@router.post("/evaluate", response_model=ApplicationAnalysisResult)
async def evaluate_application(request: ApplicationProcessRequest):
    """
    Evaluate a job application for quality and fit
    
    Returns assessment results including metrics and recommendation
    """
    try:
        result = await app_service.process_application(
            request.application_data.dict(),
            request.user_id
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        logger.error(f"Error evaluating application: {e}")
        raise HTTPException(status_code=500, detail=f"Error evaluating application: {str(e)}")

@router.get("/assessment/{application_id}", response_model=JobQualityAssessment)
async def get_assessment(application_id: str):
    """
    Get a previously saved job quality assessment
    
    Returns the assessment if found
    """
    try:
        result = await app_service.get_assessment(application_id)
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Assessment not found: {application_id}")
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving assessment: {str(e)}")

@router.post("/offer/compare/{user_id}")
async def compare_offers(user_id: str, offers: List[JobOffer]):
    """
    Compare multiple job offers for a specific user
    
    Returns comparison results ranking the offers
    """
    try:
        # This is a placeholder for future implementation
        # Would need to be implemented in the OSTApplicationService
        return {
            "message": "Offer comparison not yet implemented",
            "user_id": user_id,
            "offer_count": len(offers)
        }
    except Exception as e:
        logger.error(f"Error comparing offers: {e}")
        raise HTTPException(status_code=500, detail=f"Error comparing offers: {str(e)}")

# WebSocket for live application processing updates
@router.websocket("/ws/application-evaluation/{client_id}")
async def websocket_application_evaluation(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for streaming application evaluation updates"""
    await websocket.accept()
    try:
        # Wait for the application data
        data = await websocket.receive_text()
        request_data = json.loads(data)
        
        # Extract application data and user_id
        application_data = request_data.get("application_data", {})
        user_id = request_data.get("user_id")
        
        # Acknowledge receipt
        await websocket.send_json({
            "status": "processing", 
            "message": "Application data received, starting evaluation"
        })
        
        # Stream processing updates
        async for update in app_service.stream_application_processing(application_data, user_id):
            await websocket.send_json(update)
            
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
        try:
            await websocket.send_json({"status": "error", "message": str(e)})
        except:
            pass  # Client might be already disconnected 