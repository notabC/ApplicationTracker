from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import JSONResponse
import logging
from typing import Dict, List, Any, Optional
import json

from ..models.ost_user import (
    ResumeUpload, 
    ResumeAnalysisResponse, 
    UserProfileCreate,
    UserProfileResponse,
    QuestionSubmission
)
from ..services.ost_service import OSTService

# Setup logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Create service instance
ost_service = OSTService()

@router.post("/resume/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(resume: ResumeUpload):
    """
    Upload and analyze a resume PDF
    
    Returns job field and suggested questions for user onboarding
    """
    try:
        result = await ost_service.parse_resume(resume.file_content)
        return {
            "job_field": result["job_field"],
            "suggested_questions": result["suggested_questions"]
        }
    except Exception as e:
        logger.error(f"Error processing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@router.post("/profile/create", response_model=UserProfileResponse)
async def create_profile(submission: QuestionSubmission):
    """
    Create a user profile from onboarding question responses
    
    Returns the created user profile with a unique ID
    """
    try:
        result = await ost_service.create_user_profile(
            submission.job_field,
            submission.user_data
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        logger.error(f"Error creating profile: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating profile: {str(e)}")

@router.get("/profile/{user_id}", response_model=UserProfileResponse)
async def get_profile(user_id: str):
    """
    Get a user profile by ID
    
    Returns the user profile if found
    """
    try:
        result = await ost_service.get_user_profile(user_id)
        
        if not result:
            raise HTTPException(status_code=404, detail=f"User profile not found: {user_id}")
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving profile: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving profile: {str(e)}")

@router.post("/offer/evaluate/{user_id}")
async def evaluate_offer(user_id: str, offer: Dict[str, Any]):
    """
    Evaluate a job offer for a specific user
    
    Returns evaluation results including whether to accept the offer
    """
    try:
        result = await ost_service.evaluate_offer(user_id, offer)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        logger.error(f"Error evaluating offer: {e}")
        raise HTTPException(status_code=500, detail=f"Error evaluating offer: {str(e)}")

# WebSocket for live resume processing updates
@router.websocket("/ws/resume-processing/{client_id}")
async def websocket_resume_processing(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for streaming resume processing updates"""
    await websocket.accept()
    try:
        # Wait for the resume data
        data = await websocket.receive_text()
        resume_data = json.loads(data)
        
        # Acknowledge receipt
        await websocket.send_json({"status": "processing", "message": "Resume received, starting analysis"})
        
        # Process resume and send updates
        try:
            # Send update: Starting to parse PDF
            await websocket.send_json({"status": "processing", "step": "pdf_parsing", "message": "Parsing PDF content"})
            
            # Parse the resume
            result = await ost_service.parse_resume(resume_data.get("file_content", ""))
            
            # Send update: Extracted job field
            await websocket.send_json({
                "status": "processing", 
                "step": "job_field_extracted",
                "message": f"Identified job field: {result['job_field']}",
                "job_field": result["job_field"]
            })
            
            # Send update: Generated questions
            await websocket.send_json({
                "status": "completed",
                "message": "Resume analysis complete",
                "result": {
                    "job_field": result["job_field"],
                    "suggested_questions": result["suggested_questions"]
                }
            })
            
        except Exception as e:
            logger.error(f"Error in WebSocket processing: {e}")
            await websocket.send_json({"status": "error", "message": str(e)})
            
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
        try:
            await websocket.send_json({"status": "error", "message": str(e)})
        except:
            pass  # Client might be already disconnected 