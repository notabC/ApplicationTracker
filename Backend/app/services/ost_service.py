import os
import sys
import base64
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import uuid
import tempfile
import logging
from io import BytesIO

# Add OST directory to path
ost_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "OST")
sys.path.append(ost_path)

# Import OST modules
try:
    import PyPDF2
    from ost import MongoDBUtility, create_user_profile, add_new_field, SemanticOST
    from main import RateLimitedAPI, OSTDataTransformer
    import google.generativeai as genai
    from dotenv import load_dotenv
except ImportError as e:
    logging.error(f"Failed to import OST modules: {e}")
    # Create mock classes for development without OST
    class MongoDBUtility:
        def __init__(self): pass
        def save_document(self, *args, **kwargs): return None
        def load_data(self, *args, **kwargs): return {}
    
    class OSTDataTransformer:
        @staticmethod
        def create_ost_profile_from_main_data(*args, **kwargs): return {}, {}
        @staticmethod
        def map_job_field_to_ost_field(job_field): return job_field

load_dotenv()

logger = logging.getLogger(__name__)

class OSTService:
    """Service for OST functionality - resume parsing, user preferences, and job evaluation"""
    
    def __init__(self):
        """Initialize OST service with necessary components"""
        self.mongodb_util = MongoDBUtility()
        
        # Setup AI model if API key is available
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_model = RateLimitedAPI(genai.GenerativeModel("gemini-1.5-flash"))
        else:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            self.ai_model = None
    
    async def parse_resume(self, file_content: str) -> Dict[str, Any]:
        """
        Parse a resume PDF and extract job field and other information
        
        Args:
            file_content: Base64 encoded PDF content
            
        Returns:
            Dict with extracted information including job field
        """
        try:
            # Decode base64 content
            pdf_bytes = base64.b64decode(file_content)
            
            # Parse PDF
            reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
            resume_text = "".join(page.extract_text() for page in reader.pages)
            
            # Extract job field using AI if available
            job_field = await self._extract_job_field(resume_text)
            
            # Generate questions based on resume
            questions = await self._generate_questions(resume_text, job_field)
            
            return {
                "job_field": job_field,
                "resume_text": resume_text,
                "suggested_questions": questions
            }
        except Exception as e:
            logger.error(f"Error parsing resume: {e}")
            # Return default values in case of error
            return {
                "job_field": "unknown",
                "resume_text": "",
                "suggested_questions": [
                    {"variable": "min_salary", "question": "What is your minimum acceptable salary?"},
                    {"variable": "work_life_balance_weight", "question": "How important is work-life balance to you (1-5)?"},
                    {"variable": "compensation_weight", "question": "How important is compensation to you (1-5)?"}
                ]
            }
    
    async def _extract_job_field(self, resume_text: str) -> str:
        """Extract job field from resume text using AI"""
        if not self.ai_model:
            return "software_engineering"  # Default field
        
        try:
            prompt = f"Extract the primary job field in 1-2 words from the resume: {resume_text}"
            response = self.ai_model.generate_content(prompt)
            job_field = response.text.strip().lower()
            
            # Map to OST field name
            ost_field = OSTDataTransformer.map_job_field_to_ost_field(job_field)
            return ost_field
        except Exception as e:
            logger.error(f"Error extracting job field: {e}")
            return "software_engineering"  # Default to software_engineering on error
    
    async def _generate_questions(self, resume_text: str, job_field: str) -> List[Dict[str, str]]:
        """Generate personalized questions based on resume"""
        if not self.ai_model:
            # Return default questions if AI is not available
            return [
                {"variable": "min_salary", "question": "What is your minimum acceptable salary?"},
                {"variable": "work_life_balance_weight", "question": "How important is work-life balance to you (1-5)?"},
                {"variable": "compensation_weight", "question": "How important is compensation to you (1-5)?"},
                {"variable": "career_growth_weight", "question": "How important is career growth to you (1-5)?"},
                {"variable": "job_search_urgency", "question": "How urgently do you need to find a job (1-10)?"}
            ]
        
        try:
            # Standard variables to ensure we get these
            standard_keys = "min_salary, compensation_weight, career_growth_weight, work_life_balance_weight, risk_tolerance, job_search_urgency"
            
            prompt = f"""
            Based on the resume, generate personalized questions for these standard variables:
            - min_salary: Minimum acceptable annual salary
            - compensation_weight: Importance of compensation (1-5)
            - career_growth_weight: Importance of career growth (1-5)
            - work_life_balance_weight: Importance of work-life balance (1-5)
            - risk_tolerance: Willingness to wait for better offers (1-10)
            - job_search_urgency: Urgency to find a new job (1-10)
            
            Add 3-5 extra questions based on the resume, each asking for a 1-5 rating, with unique variable names not in the standard list ({standard_keys}).
            Ensure all questions are distinct and tailored to the user's background.
            Format:
            Variable: [variable_name]
            Question: [question_text]
            Resume: {resume_text}
            """
            
            response = self.ai_model.generate_content(prompt)
            
            lines = response.text.strip().split("\n")
            questions = []
            i = 0
            while i < len(lines):
                if lines[i].startswith("Variable:"):
                    variable = lines[i].split(":", 1)[1].strip()
                    i += 1
                    if i < len(lines) and lines[i].startswith("Question:"):
                        question = lines[i].split(":", 1)[1].strip()
                        questions.append({"variable": variable, "question": question})
                    else:
                        logger.warning(f"Question missing for {variable}")
                i += 1
            
            if not questions:
                # Fallback if parsing failed
                questions = [
                    {"variable": "min_salary", "question": "What is your minimum acceptable salary?"},
                    {"variable": "work_life_balance_weight", "question": "How important is work-life balance to you (1-5)?"},
                    {"variable": "compensation_weight", "question": "How important is compensation to you (1-5)?"},
                    {"variable": "career_growth_weight", "question": "How important is career growth to you (1-5)?"},
                    {"variable": "job_search_urgency", "question": "How urgently do you need to find a job (1-10)?"}
                ]
                logger.warning("Failed to parse questions, using fallbacks")
            
            return questions
            
        except Exception as e:
            logger.error(f"Error generating questions: {e}")
            # Return default questions in case of error
            return [
                {"variable": "min_salary", "question": "What is your minimum acceptable salary?"},
                {"variable": "work_life_balance_weight", "question": "How important is work-life balance to you (1-5)?"},
                {"variable": "compensation_weight", "question": "How important is compensation to you (1-5)?"},
                {"variable": "career_growth_weight", "question": "How important is career growth to you (1-5)?"},
                {"variable": "job_search_urgency", "question": "How urgently do you need to find a job (1-10)?"}
            ]
    
    async def create_user_profile(self, job_field: str, user_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create a user profile and preferences in OST format
        
        Args:
            job_field: The user's job field
            user_data: User responses from the onboarding questions
            
        Returns:
            Dict with user profile information including user_id
        """
        try:
            # Transform data to OST format
            user_profile, user_preferences = OSTDataTransformer.create_ost_profile_from_main_data(
                job_field, user_data
            )
            
            # Generate user_id if not present
            if "user_id" not in user_profile:
                user_id = str(uuid.uuid4())
                user_profile["user_id"] = user_id
                user_preferences["user_id"] = user_id
            
            # Add timestamp
            user_profile["created_at"] = datetime.now().isoformat()
            
            # Save to MongoDB
            self.mongodb_util.save_document(
                "user_profiles", 
                user_profile, 
                {"user_id": user_profile["user_id"]}
            )
            
            self.mongodb_util.save_document(
                "user_preferences", 
                user_preferences, 
                {"user_id": user_preferences["user_id"]}
            )
            
            # Return user profile for the frontend
            return {
                "user_id": user_profile["user_id"],
                "job_field": user_profile["field"],
                "experience_level": user_profile.get("experience_level", "mid"),
                "preferences": user_preferences,
                "created_at": user_profile["created_at"]
            }
        except Exception as e:
            logger.error(f"Error creating user profile: {e}")
            # Return a minimal profile with error information
            return {
                "user_id": str(uuid.uuid4()),
                "job_field": job_field,
                "preferences": {},
                "error": str(e)
            }
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a user profile by ID
        
        Args:
            user_id: The user's ID
            
        Returns:
            User profile or None if not found
        """
        try:
            user_profile = self.mongodb_util.load_data("user_profiles", {"user_id": user_id})
            user_preferences = self.mongodb_util.load_data("user_preferences", {"user_id": user_id})
            
            if not user_profile or not user_preferences:
                return None
            
            return {
                "user_id": user_profile["user_id"],
                "job_field": user_profile.get("field", "unknown"),
                "experience_level": user_profile.get("experience_level", "mid"),
                "preferences": user_preferences,
                "created_at": user_profile.get("created_at")
            }
        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return None
    
    async def evaluate_offer(self, user_id: str, offer: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate a job offer for a specific user
        
        Args:
            user_id: The user's ID
            offer: The job offer to evaluate
            
        Returns:
            Evaluation results
        """
        try:
            # Load user profile and preferences
            user_profile = self.mongodb_util.load_data("user_profiles", {"user_id": user_id})
            user_preferences = self.mongodb_util.load_data("user_preferences", {"user_id": user_id})
            
            if not user_profile or not user_preferences:
                raise ValueError(f"User profile not found for user_id: {user_id}")
            
            # Create OST algorithm
            ost = SemanticOST(user_profile, user_preferences)
            
            # Evaluate the offer
            should_accept, reason, details = ost.should_accept_offer(offer, 0)  # 0 is the time point (day 0)
            
            # Calculate utility
            utility = ost.calculate_offer_utility(offer)
            
            # Threshold at current time
            threshold = ost.get_reservation_utility(0)
            
            # Observe the offer (learn from it)
            ost.observe_offer(offer, 0)
            
            # Get search insights
            insights = ost.get_search_insights()
            
            return {
                "offer": offer,
                "utility": utility,
                "threshold": threshold,
                "should_accept": should_accept,
                "reason": reason,
                "details": details,
                "insights": insights
            }
        except Exception as e:
            logger.error(f"Error evaluating offer: {e}")
            return {
                "offer": offer,
                "error": str(e),
                "should_accept": False,
                "reason": "Error evaluating offer"
            } 