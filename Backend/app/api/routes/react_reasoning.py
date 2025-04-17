"""
WebSocket endpoint for ReAct reasoning.

This module provides WebSocket endpoints for interactive reasoning using
the ReAct reasoning framework.
"""

import json
import logging
import uuid
from typing import Dict, Any, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import JSONResponse

from app.agents.reasoners.react_reasoner import ReActReasoner
from app.agents.tools.tool_executor import ToolExecutor
from app.agents.tools.calculator import register_calculator_tools
from app.llm.provider_manager import ProviderManager

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Store active sessions
active_sessions: Dict[str, Dict[str, Any]] = {}


@router.websocket("/ws/reasoning")
async def reasoning_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for interactive ReAct reasoning.
    
    This endpoint allows clients to connect and interact with the ReAct reasoning
    framework, sending queries and receiving step-by-step reasoning traces.
    """
    # Accept the WebSocket connection
    await websocket.accept()
    
    # Generate a unique session ID
    session_id = str(uuid.uuid4())
    
    # Set up the provider manager to get the model
    provider_manager = ProviderManager()
    model = provider_manager.get_provider().get_chat_model()
    
    # Initialize tool executor
    tool_executor = ToolExecutor()
    
    # Register calculator tools for testing and demo purposes
    register_calculator_tools(tool_executor)
    
    # Initialize reasoner
    reasoner = ReActReasoner(
        model=model,
        name="Interactive ReAct Agent",
        tools=tool_executor.get_tool_specs(),
        max_iterations=10,
        stop_at_answer=True
    )
    
    # Store session info
    active_sessions[session_id] = {
        "reasoner": reasoner,
        "tool_executor": tool_executor,
        "tools": []
    }
    
    # Send session ID to client
    await websocket.send_json({
        "type": "session_created",
        "session_id": session_id
    })
    
    try:
        # Main WebSocket loop
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message["type"] == "register_tools":
                # Logic to register tools would go here
                # For demo, we're just acknowledging
                await websocket.send_json({
                    "type": "tools_registered",
                    "count": len(message.get("tools", []))
                })
                
            elif message["type"] == "query":
                # Get session info
                session = active_sessions.get(session_id)
                if not session:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Invalid session"
                    })
                    continue
                
                # Get query from message
                query = message.get("query", "")
                context = message.get("context", "")
                
                if not query:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Query is required"
                    })
                    continue
                
                # Send acknowledgement
                await websocket.send_json({
                    "type": "processing",
                    "message": "Processing your query..."
                })
                
                # Set up reasoning handler to send updates during reasoning
                async def reasoning_handler(step_data):
                    """Send reasoning steps to client as they occur"""
                    await websocket.send_json({
                        "type": "reasoning_step",
                        "step": step_data
                    })
                
                # Execute reasoning process
                try:
                    # Set up the reasoner with the handler
                    reasoner.on_step = reasoning_handler
                    
                    # Execute reasoning
                    result = await reasoner.reason({
                        "query": query,
                        "context": context
                    }, session["tool_executor"])
                    
                    # Send complete result
                    await websocket.send_json({
                        "type": "reasoning_complete",
                        "result": {
                            "answer": result.get("answer"),
                            "iterations": result.get("iterations"),
                            "stopping_reason": result.get("stopping_reason")
                        }
                    })
                    
                except Exception as e:
                    logger.error(f"Error in reasoning: {str(e)}", exc_info=True)
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Reasoning error: {str(e)}"
                    })
            
            elif message["type"] == "close":
                # Clean up session
                if session_id in active_sessions:
                    del active_sessions[session_id]
                
                await websocket.send_json({
                    "type": "session_closed",
                    "session_id": session_id
                })
                break
                
    except WebSocketDisconnect:
        # Clean up on disconnect
        if session_id in active_sessions:
            del active_sessions[session_id]
        logger.info(f"WebSocket disconnected for session {session_id}")
        
    except Exception as e:
        logger.error(f"Error in WebSocket: {str(e)}", exc_info=True)
        try:
            await websocket.send_json({
                "type": "error",
                "message": f"Server error: {str(e)}"
            })
        except:
            pass  # Client might be disconnected already 