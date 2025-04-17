from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import JSONResponse
import logging
from typing import Dict, List, Any, Optional
import json
import asyncio

from ..models.ost_user import (
    ResumeUpload, 
    ResumeAnalysisResponse, 
    UserProfileCreate,
    UserProfileResponse,
    QuestionSubmission
)
from ..services.ost_service import OSTService, get_conversation_state, clear_conversation_state

# Setup logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Create service instance
ost_service = OSTService()

@router.get("/profile/{user_id}", response_model=UserProfileResponse)
async def get_profile(user_id: str):
    """
    Get a user profile by ID
    (Assumes profile was previously created via the onboarding flow)
    """
    try:
        result = await ost_service.get_user_profile(user_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"User profile not found: {user_id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error retrieving profile {user_id}: {e}")
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
        logger.exception(f"Error evaluating offer for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error evaluating offer: {str(e)}")

@router.websocket("/ws/onboarding/{session_id}")
async def websocket_onboarding(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for the entire OST onboarding flow (resume + questions)."""
    await websocket.accept()
    logger.info(f"WebSocket connection established for session: {session_id}")
    
    try:
        while True:
            # Wait for messages from the client
            raw_data = await websocket.receive_text()
            message_data = json.loads(raw_data)
            message_type = message_data.get("type")
            
            logger.debug(f"Received WS message type: {message_type} for session {session_id}")

            if message_type == "start_with_resume":
                file_content = message_data.get("file_content")
                if not file_content:
                    await websocket.send_json({"type": "error", "message": "Missing file_content for resume."})
                    continue
                
                # Process resume and start conversation using the service generator
                async for update in ost_service.process_resume_and_start_conversation(session_id, file_content):
                    await websocket.send_json(update)
                    # If an error occurred during resume processing, break the loop
                    if update.get("type") == "error": 
                        raise WebSocketDisconnect(code=1011, reason=update.get("message"))
            
            elif message_type == "answer":
                variable = message_data.get("variable")
                answer_text = message_data.get("answer_text")
                if not variable or answer_text is None:
                    await websocket.send_json({"type": "error", "message": "Missing variable or answer_text."})
                    continue
                    
                # Handle the answer using the service generator
                async for update in ost_service.handle_user_answer(session_id, variable, answer_text):
                    await websocket.send_json(update)
                    # If an error occurred during answer handling, break the loop
                    if update.get("type") == "error": 
                        # Don't necessarily disconnect, let the service decide if it can recover
                        logger.error(f"Error handling answer for session {session_id}: {update.get('message')}")
                    # If profile created, the loop can end for this session from client side or here
                    if update.get("type") == "profile_created":
                         logger.info(f"Profile created for session {session_id}")
                         # Optionally close from server side: await websocket.close(); break 

            else:
                logger.warning(f"Received unknown WS message type: {message_type} for session {session_id}")
                await websocket.send_json({"type": "error", "message": f"Unknown message type: {message_type}"})

    except WebSocketDisconnect as e:
        logger.info(f"WebSocket disconnected for session {session_id}. Code: {e.code}, Reason: {e.reason}")
        clear_conversation_state(session_id)
    except json.JSONDecodeError:
        logger.warning(f"Received invalid JSON from session {session_id}")
        # Optionally send error back before closing
        try: await websocket.send_json({"type": "error", "message": "Invalid JSON format."}) 
        except: pass
        clear_conversation_state(session_id)
    except Exception as e:
        logger.exception(f"Unexpected WebSocket error for session {session_id}: {e}")
        # Try to send error before closing
        try: await websocket.send_json({"type": "error", "message": f"An unexpected server error occurred: {str(e)}"}) 
        except: pass
        clear_conversation_state(session_id)
    finally:
        # Ensure state cleanup happens even if connection drops unexpectedly
        logger.info(f"Cleaning up state for session {session_id}")
        clear_conversation_state(session_id) 