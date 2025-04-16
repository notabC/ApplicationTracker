import os
import sys
import logging
from typing import Dict, List, Any, Optional, Tuple
import asyncio
from datetime import datetime
import uuid

# Add OST directory to path
ost_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "OST")
sys.path.append(ost_path)

# Import OST modules
try:
    from ost import MongoDBUtility, create_user_profile
    from application_process import (
        process_application, 
        ApplicationProcessingConfig, 
        JobQualityMetric,
        ApplicationProcessingWorkflowBuilder
    )
    from main import AutomatedMetaReasoningAgent, RateLimitedAPI, MongoDBStorage
    import google.generativeai as genai
    from dotenv import load_dotenv
except ImportError as e:
    logging.error(f"Failed to import OST application_process modules: {e}")
    # Create mock classes for development without OST
    class MongoDBUtility:
        def __init__(self): pass
        def save_document(self, *args, **kwargs): return None
        def load_data(self, *args, **kwargs): return {}
    
    class ApplicationProcessingConfig:
        def __init__(self, *args, **kwargs): pass
    
    class JobQualityMetric:
        def __init__(self, *args, **kwargs): pass
    
    def process_application(*args, **kwargs):
        return {"error": "OST module not available"}

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class OSTApplicationService:
    """Service for OST application processing functionality"""
    
    def __init__(self):
        """Initialize the application processing service"""
        self.mongodb_util = MongoDBUtility()
        
        # Setup AI model if API key is available
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_model = RateLimitedAPI(genai.GenerativeModel("gemini-1.5-flash"))
        else:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            self.ai_model = None
            
        # Initialize application processing config
        self.config = self._initialize_config()
    
    def _initialize_config(self) -> ApplicationProcessingConfig:
        """Initialize the application processing configuration"""
        try:
            config = ApplicationProcessingConfig()
            
            # Add custom metrics if needed
            # config.add_metric(JobQualityMetric(...))
            
            return config
        except Exception as e:
            logger.error(f"Error initializing application processing config: {e}")
            return ApplicationProcessingConfig()
    
    async def process_application(self, 
                                application_data: Dict[str, Any], 
                                user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a job application and evaluate its quality
        
        Args:
            application_data: Data about the job application
            user_id: Optional user ID to fetch user preferences
            
        Returns:
            Assessment results
        """
        try:
            # Load user preferences if user_id is provided
            user_preferences = None
            if user_id:
                user_preferences = self.mongodb_util.load_data("user_preferences", {"user_id": user_id})
                
                if not user_preferences:
                    logger.warning(f"User preferences not found for user_id: {user_id}")
            
            # Use a background thread to run the CPU-intensive process_application function
            # This keeps the FastAPI server responsive for other requests
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: process_application(
                    application_data=application_data,
                    user_preferences=user_preferences,
                    user_id=user_id,
                    automated=True  # Run in automated mode without user interaction
                )
            )
            
            # Format the result for API response
            formatted_result = self._format_assessment_result(result, application_data)
            
            # Save the result to MongoDB
            self._save_assessment_result(formatted_result)
            
            return formatted_result
            
        except Exception as e:
            logger.error(f"Error processing application: {e}")
            return {
                "error": str(e),
                "application_id": application_data.get("job_id", str(uuid.uuid4())),
                "overall_score": 0,
                "metrics": {},
                "reasoning": {"error": str(e)},
                "recommendation": "Error occurred during processing"
            }
    
    def _format_assessment_result(self, 
                                result: Dict[str, Any], 
                                application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format the assessment result for API response"""
        try:
            # Extract job quality metrics
            metrics = result.get("job_quality_metrics", {})
            
            # Extract reasoning traces
            reasoning_traces = result.get("reasoning_traces", [])
            reasoning = {}
            
            # Format reasoning traces into a more user-friendly structure
            for trace in reasoning_traces:
                metric_key = trace.get("metric", "unknown")
                reasoning_text = trace.get("reasoning", "")
                confidence = trace.get("confidence", 0)
                
                reasoning[metric_key] = {
                    "text": reasoning_text,
                    "confidence": confidence
                }
            
            # Extract overall recommendation
            overall_score = result.get("overall_score", 0)
            recommendation = "Consider applying" if overall_score >= 7 else "Think carefully"
            if overall_score < 4:
                recommendation = "Not recommended"
            
            # Extract knowledge gaps
            knowledge_gaps = result.get("knowledge_gaps", {})
            missing_info = [key for key, value in knowledge_gaps.items() if value]
            
            return {
                "application_id": application_data.get("job_id", str(uuid.uuid4())),
                "job_title": application_data.get("position", "Unknown Position"),
                "company": application_data.get("company", "Unknown Company"),
                "overall_score": overall_score,
                "metrics": metrics,
                "reasoning": reasoning,
                "recommendation": recommendation,
                "recommendation_confidence": result.get("recommendation_confidence", 0.5),
                "knowledge_gaps": missing_info,
                "created_at": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error formatting assessment result: {e}")
            return {
                "application_id": application_data.get("job_id", str(uuid.uuid4())),
                "overall_score": 0,
                "metrics": {},
                "reasoning": {"error": str(e)},
                "recommendation": "Error formatting results"
            }
    
    def _save_assessment_result(self, result: Dict[str, Any]) -> bool:
        """Save the assessment result to MongoDB"""
        try:
            self.mongodb_util.save_document(
                "job_assessments",
                result,
                {"application_id": result["application_id"]}
            )
            return True
        except Exception as e:
            logger.error(f"Error saving assessment result: {e}")
            return False
    
    async def get_assessment(self, application_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a previously saved assessment by application ID
        
        Args:
            application_id: The application's ID
            
        Returns:
            Assessment data or None if not found
        """
        try:
            assessment = self.mongodb_util.load_data(
                "job_assessments",
                {"application_id": application_id}
            )
            return assessment
        except Exception as e:
            logger.error(f"Error getting assessment: {e}")
            return None
    
    async def stream_application_processing(self, 
                                     application_data: Dict[str, Any],
                                     user_id: Optional[str] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream the application processing steps in real-time
        
        Args:
            application_data: Data about the job application
            user_id: Optional user ID to fetch user preferences
            
        Yields:
            Updates about the processing steps
        """
        try:
            # Yield initial status update
            yield {
                "status": "starting",
                "message": "Starting application processing",
                "timestamp": datetime.now().isoformat()
            }
            
            # Load user preferences if user_id is provided
            user_preferences = None
            if user_id:
                user_preferences = self.mongodb_util.load_data("user_preferences", {"user_id": user_id})
                
                if not user_preferences:
                    logger.warning(f"User preferences not found for user_id: {user_id}")
                else:
                    yield {
                        "status": "processing",
                        "step": "user_preferences_loaded",
                        "message": "Loaded user preferences",
                        "timestamp": datetime.now().isoformat()
                    }
                    
            # Initialize processing steps
            yield {
                "status": "processing",
                "step": "enriching_data",
                "message": "Enriching application data with additional information",
                "timestamp": datetime.now().isoformat()
            }
            
            # Simulate streaming processing (in actual implementation, this would monitor the actual processing)
            await asyncio.sleep(1)
            
            yield {
                "status": "processing",
                "step": "researching_company",
                "message": "Researching company information",
                "timestamp": datetime.now().isoformat()
            }
            
            await asyncio.sleep(1)
            
            yield {
                "status": "processing",
                "step": "analyzing_job_description",
                "message": "Analyzing job description and requirements",
                "timestamp": datetime.now().isoformat()
            }
            
            await asyncio.sleep(1)
            
            yield {
                "status": "processing",
                "step": "evaluating_metrics",
                "message": "Evaluating job quality metrics",
                "timestamp": datetime.now().isoformat()
            }
            
            # Actually process the application
            result = await self.process_application(application_data, user_id)
            
            # Yield final result
            yield {
                "status": "completed",
                "message": "Application processing complete",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in stream_application_processing: {e}")
            yield {
                "status": "error",
                "message": f"Error processing application: {str(e)}",
                "timestamp": datetime.now().isoformat()
            } 