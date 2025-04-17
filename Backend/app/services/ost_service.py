import os
import sys
import base64
import json
from typing import Dict, List, Any, Optional, Tuple, AsyncGenerator
from datetime import datetime
import uuid
import tempfile
import logging
from io import BytesIO
import asyncio
from dotenv import load_dotenv
import PyPDF2

# Add OST directory to path
ost_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "OST")
sys.path.append(ost_path)

# Import ReAct reasoner
from app.agents.reasoners.react_reasoner import ReActReasoner
from app.agents.tools.tool_executor import ToolExecutor
from app.llm.provider_manager import ProviderManager

# Model adapter for ReActReasoner
class ModelAdapter:
    """Adapter to make different model interfaces compatible with ReActReasoner"""
    
    def __init__(self, model):
        self.model = model
        self.logger = logging.getLogger(__name__)
    
    async def generate(self, messages=None, **kwargs):
        """Adapt to the generate method expected by ReActReasoner"""
        try:
            # For RateLimitedAPI from provider_manager
            if hasattr(self.model, 'generate_content'):
                # Extract prompt from messages
                prompt = "\n\n".join([m["content"] for m in messages])
                
                try:
                    # Try async first
                    if hasattr(self.model, 'agenerate_content'):
                        response = await self.model.agenerate_content(prompt)
                    else:
                        # Fall back to sync
                        response = self.model.generate_content(prompt)
                    
                    # Handle different response formats
                    content_text = None
                    
                    # Try to access text attribute (Gemini style)
                    if hasattr(response, 'text'):
                        content_text = response.text
                    # Try to access content attribute (OpenAI style)
                    elif hasattr(response, 'content'):
                        content_text = response.content
                    # Try to access choices[0].message.content (OpenAI API style)
                    elif hasattr(response, 'choices') and len(response.choices) > 0:
                        if hasattr(response.choices[0], 'message'):
                            content_text = response.choices[0].message.content
                    # Try dictionary format
                    elif isinstance(response, dict):
                        if 'text' in response:
                            content_text = response['text']
                        elif 'content' in response:
                            content_text = response['content']
                        elif 'choices' in response and len(response['choices']) > 0:
                            if 'message' in response['choices'][0]:
                                content_text = response['choices'][0]['message']['content']
                    
                    # If we couldn't extract text, set a default
                    if not content_text:
                        self.logger.warning(f"Couldn't extract text from response: {response}")
                        content_text = "I couldn't determine a proper answer."
                    
                    # Create a response object compatible with ReActReasoner
                    class ChoiceObject:
                        def __init__(self, text):
                            self.message = type('obj', (object,), {'content': text})
                    
                    return type('obj', (object,), {
                        'choices': [ChoiceObject(content_text)]
                    })
                    
                except Exception as e:
                    self.logger.error(f"Error generating content: {str(e)}")
                    # Use default text response
                    class ChoiceObject:
                        def __init__(self):
                            self.message = type('obj', (object,), {
                                'content': f"I encountered an error while trying to respond."
                            })
                    
                    return type('obj', (object,), {
                        'choices': [ChoiceObject()]
                    })
            
            # For standard OpenAI-like models
            if hasattr(self.model, 'invoke'):
                try:
                    response = await self.model.invoke(**kwargs)
                    return response
                except Exception as e:
                    self.logger.error(f"Error invoking model: {str(e)}")
                    # Return minimal response to avoid breaking
                    class FallbackResponse:
                        def __init__(self):
                            self.choices = [type('obj', (object,), {
                                'message': type('obj', (object,), {
                                    'content': f"Error occurred: {str(e)}. Using fallback response."
                                })
                            })]
                    
                    return FallbackResponse()
            
            # Fallback - try a direct function call if the model is callable
            if callable(self.model):
                try:
                    if asyncio.iscoroutinefunction(self.model):
                        response = await self.model(messages)
                    else:
                        response = self.model(messages)
                    
                    # Try to parse the response
                    if isinstance(response, str):
                        class ChoiceObject:
                            def __init__(self, text):
                                self.message = type('obj', (object,), {'content': text})
                        
                        return type('obj', (object,), {
                            'choices': [ChoiceObject(response)]
                        })
                    else:
                        return response
                except Exception as e:
                    self.logger.error(f"Error calling model directly: {str(e)}")
            
            # If we couldn't adapt, raise an error
            raise ValueError(f"Unsupported model type: {type(self.model)}")
            
        except Exception as e:
            self.logger.error(f"Error in model adapter: {str(e)}")
            # Return minimal response to avoid breaking
            class FallbackResponse:
                def __init__(self):
                    self.choices = [type('obj', (object,), {
                        'message': type('obj', (object,), {
                            'content': f"Error occurred in adapter: {str(e)}. Using fallback response."
                        })
                    })]
            
            return FallbackResponse()

# Create mock classes as fallbacks
class MongoDBUtility:
    def __init__(self): pass
    def save_document(self, *args, **kwargs): return None
    def load_data(self, *args, **kwargs): return {}
class OSTDataTransformer:
    @staticmethod
    def create_ost_profile_from_main_data(*args, **kwargs): return {}, {}
    @staticmethod
    def map_job_field_to_ost_field(job_field): return job_field
class RateLimitedAPI: 
    def generate_content(self, *args, **kwargs): return type('obj', (object,), {'text': 'Number: 3\nConfidence: 0.8'})
class WorkflowConfig: pass
VARIABLE_TYPES = {}
DEFAULT_FIELD_PROFILES = {}
DEFAULT_FIELD_PREFERENCES = {}
def create_user_profile(*args, **kwargs): return {}, {}
SemanticOST = None

# Import necessary modules - defer actual import to avoid circular imports
def import_ost_modules():
    global MongoDBUtility, create_user_profile, add_new_field, SemanticOST, DEFAULT_FIELD_PROFILES
    global DEFAULT_FIELD_PREFERENCES, VARIABLE_TYPES, RateLimitedAPI, OSTDataTransformer, WorkflowConfig
    
    try:
        
        from ost import MongoDBUtility, create_user_profile, add_new_field, SemanticOST, DEFAULT_FIELD_PROFILES, DEFAULT_FIELD_PREFERENCES, VARIABLE_TYPES
        from main import RateLimitedAPI, OSTDataTransformer, WorkflowConfig
        import google.generativeai as genai
        return True, genai
    except ImportError as e:
        logging.error(f"Failed to import OST modules: {e}")
        return False, None

load_dotenv()

logger = logging.getLogger(__name__)

# --- Conversation State Management ---
# In a real application, this state should be stored more robustly (e.g., Redis, DB)
# Using a simple dict for demonstration purposes
conversation_states: Dict[str, Dict[str, Any]] = {}

def get_conversation_state(session_id: str) -> Dict[str, Any]:
    if session_id not in conversation_states:
        conversation_states[session_id] = {
            "job_field": "unknown",
            "questions": [],
            "current_question_index": -1,
            "user_data": [], # Stores final validated {question_type, question, response, data_type}
            "conversation_history": [], # Raw Q&A for context
            "current_responses": [], # Responses for the *current* question being interpreted
            "variable_schema_map": {},
            "confidence_threshold": 0.7, # Default, can be configured
            "max_followups": 2,
            "current_followup_count": 0
        }
    return conversation_states[session_id]

def update_conversation_state(session_id: str, updates: Dict[str, Any]):
    state = get_conversation_state(session_id)
    state.update(updates)

def clear_conversation_state(session_id: str):
    if session_id in conversation_states:
        del conversation_states[session_id]

# --- Value Interpretation Tools ---

class ValueExtractorTool:
    """Tool for extracting numerical values from text responses"""
    
    def extract_number(self, text: str, min_val: float = None, max_val: float = None) -> Dict[str, Any]:
        """
        Extract a numerical value from text, with optional range validation
        
        Args:
            text: The text to extract a number from
            min_val: Optional minimum allowed value
            max_val: Optional maximum allowed value
            
        Returns:
            Dictionary with extracted value and confidence
        """
        import re
        
        # First try semantic interpretation for importance/rating scales
        if min_val is not None and max_val is not None and max_val <= 10:
            semantic_result = self.interpret_scale_value(text, min_val, max_val)
            if semantic_result.get("value") is not None:
                return semantic_result
        
        # Extract numbers using regex
        numbers = re.findall(r'\b\d+\b', text)
        
        if not numbers:
            # Look for number words
            number_words = {
                'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
                'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
            }
            
            for word, value in number_words.items():
                if word in text.lower():
                    numbers.append(str(value))
        
        if not numbers:
            return {
                "value": None,
                "confidence": 0.0,
                "explanation": "No numerical value found in the text."
            }
            
        # Use the first number found
        value = float(numbers[0])
        
        # Validate range if provided
        if min_val is not None and value < min_val:
            return {
                "value": min_val,
                "confidence": 0.5,
                "explanation": f"Value {value} is below minimum {min_val}. Using minimum value."
            }
            
        if max_val is not None and value > max_val:
            return {
                "value": max_val,
                "confidence": 0.5,
                "explanation": f"Value {value} is above maximum {max_val}. Using maximum value."
            }
            
        return {
            "value": value,
            "confidence": 0.9,
            "explanation": f"Found numerical value {value} in the text."
        }
    
    def interpret_scale_value(self, text: str, min_val: float, max_val: float) -> Dict[str, Any]:
        """
        Interpret linguistic descriptions of importance or ratings
        
        Args:
            text: The text to interpret
            min_val: Minimum scale value
            max_val: Maximum scale value
            
        Returns:
            Dictionary with interpreted value and confidence
        """
        text_lower = text.lower()
        
        # For 1-5 scale (common for importance ratings)
        if min_val == 1 and max_val == 5:
            # Check for negations first
            negations = ["not", "don't", "doesn't", "isn't", "aren't", "won't", "wouldn't", "no"]
            has_negation = any(neg in text_lower.split() for neg in negations)
            
            # Extremely high importance (5/5)
            if not has_negation and any(phrase in text_lower for phrase in [
                "extremely important", "very important", "critical", "essential", 
                "highest priority", "top priority", "crucial", "vital",
                "most important", "5", "five", "5/5", "maximum", "100%", 
                "definitely", "absolutely", "completely", "love it", "10/10",
                "hell yeah", "hell yes", "omg yes", "yes!!!", "awesome", "perfect",
                "i need it", "can't live without it", "need", "must have", "vital",
                "absolutely", "top", "best", "great", "priority", "fantastic",
                "amazing", "excellent", "fire", "lit", "superb", "outstanding"
            ]) or any(emoji in text for emoji in ["😍", "❤️", "🔥", "💯", "👍👍", "✓✓✓"]):
                return {
                    "value": 5,
                    "confidence": 0.9,
                    "explanation": f"Interpreted '{text}' as highest importance (5/5)"
                }
                
            # High importance (4/5)
            if not has_negation and any(phrase in text_lower for phrase in [
                "important", "high priority", "quite important",
                "significantly", "considerably", "4", "four", "4/5",
                "very", "highly", "pretty important", "much", "really",
                "want it", "would like it", "prefer", "pretty good", "solid",
                "significant", "a lot", "quite", "rather", "notable", "yes",
                "strong", "big", "major", "key", "certainly", "core"
            ]) or any(emoji in text for emoji in ["👍", "✓✓", "😊", "👌", "🙂"]):
                return {
                    "value": 4,
                    "confidence": 0.85,
                    "explanation": f"Interpreted '{text}' as high importance (4/5)"
                }
                
            # Medium importance (3/5)
            if not has_negation and any(phrase in text_lower for phrase in [
                "somewhat important", "moderately important", "medium priority",
                "average", "middle", "neutral", "3", "three", "3/5", "50-50",
                "balanced", "fair", "moderate", "reasonable", "ok", "okay",
                "alright", "fine", "decent", "satisfactory", "passable", "so-so",
                "meh", "middling", "halfway", "like", "whatever", "kinda", "mid",
                "sort of", "partially", "semi", "halfway", "intermediate", "standard"
            ]) or any(emoji in text for emoji in ["😐", "🤷", "👍👎", "🆗", "⚖️", "↔️"]):
                return {
                    "value": 3,
                    "confidence": 0.8,
                    "explanation": f"Interpreted '{text}' as medium importance (3/5)"
                }
                
            # Low importance (2/5)
            if not has_negation and any(phrase in text_lower for phrase in [
                "slightly important", "low priority", "not very important",
                "marginal", "secondary", "2", "two", "2/5", "little",
                "not a priority", "less important", "limited",
                "barely", "hardly", "minor", "small", "not much", "negligible",
                "rarely", "seldom", "borderline", "not really", "mildly", 
                "don't really care", "kinda don't care", "not that important",
                "not needed much", "could live without", "not big on", "slight"
            ]) or any(emoji in text for emoji in ["👎", "😕", "😒", "🤏", "⚠️"]):
                return {
                    "value": 2,
                    "confidence": 0.8,
                    "explanation": f"Interpreted '{text}' as low importance (2/5)"
                }
            
            # Look explicitly for "not important" pattern
            if has_negation and "important" in text_lower:
                return {
                    "value": 1,
                    "confidence": 0.9,
                    "explanation": f"Interpreted '{text}' with negation as minimal importance (1/5)"
                }
                
            # Minimal importance (1/5)
            if any(phrase in text_lower for phrase in [
                "not important", "lowest priority", "negligible", "trivial",
                "irrelevant", "unnecessary", "don't care", "doesn't matter", 
                "1", "one", "1/5", "minimal", "least", "not at all", "worthless",
                "who cares", "useless", "pointless", "waste", "hate it", "no way",
                "garbage", "terrible", "awful", "0/10", "nope", "hell no", "trash",
                "junk", "nothing", "zero", "not needed", "never", "absolutely not",
                "don't want", "avoid", "reject", "dismiss", "disregard", "ignore",
                "idc", "idgaf", "wtf", "dumb"
            ]) or any(emoji in text for emoji in ["👎👎", "❌", "🚫", "😡", "🤮", "💩", "🤬", "😤"]):
                return {
                    "value": 1,
                    "confidence": 0.85,
                    "explanation": f"Interpreted '{text}' as minimal importance (1/5)"
                }

            # Specific handling for "v important" or "v importan" (abbreviated "very important")
            if "v import" in text_lower:
                return {
                    "value": 5,
                    "confidence": 0.85,
                    "explanation": f"Interpreted '{text}' as abbreviated 'very important' (5/5)"
                }
        
        # For 1-10 scale
        elif min_val == 1 and max_val == 10:
            # Detect indicators of high values (8-10)
            if any(phrase in text_lower for phrase in [
                "extremely", "very", "highest", "maximum", "completely",
                "absolutely", "definitely", "crucial", "critical", "important",
                "essential", "top", "best", "excellent", "superb", "outstanding",
                "terrific", "great", "awesome", "amazing", "fantastic", "priority"
            ]) or any(emoji in text for emoji in ["😍", "❤️", "🔥", "💯", "👍👍"]):
                return {
                    "value": 9,  # Use 9 as default high value
                    "confidence": 0.8,
                    "explanation": f"Interpreted '{text}' as very high (9/10)"
                }
                
            # Medium-high values (6-7)
            if any(phrase in text_lower for phrase in [
                "important", "significant", "considerable", "quite", "rather",
                "fairly", "pretty", "reasonably", "good", "solid", "strong",
                "notable", "substantial", "significant", "worthwhile", "meaningful",
                "useful", "valuable", "beneficial", "helpful", "advantageous"
            ]) or any(emoji in text for emoji in ["👍", "👌", "🙂"]):
                return {
                    "value": 7,
                    "confidence": 0.75,
                    "explanation": f"Interpreted '{text}' as medium-high (7/10)"
                }
                
            # Medium values (4-6)
            if any(phrase in text_lower for phrase in [
                "moderate", "average", "medium", "neutral", "balanced", 
                "middle", "somewhat", "ok", "okay", "fair", "decent", "adequate",
                "satisfactory", "acceptable", "sufficient", "tolerable", "passable",
                "fine", "alright", "so-so", "meh", "middling", "intermediate"
            ]) or any(emoji in text for emoji in ["😐", "🤷", "👍👎", "🆗"]):
                return {
                    "value": 5,
                    "confidence": 0.7,
                    "explanation": f"Interpreted '{text}' as medium (5/10)"
                }
                
            # Low values (1-3)
            if any(phrase in text_lower for phrase in [
                "not important", "unimportant", "minor", "minimal", "slight",
                "little", "hardly", "rarely", "never", "not at all", "negligible",
                "trivial", "insignificant", "inconsequential", "irrelevant",
                "unessential", "unnecessary", "dispensable", "superfluous",
                "worthless", "useless", "pointless", "needless", "not needed",
                "no", "nope", "not", "never", "don't", "doesn't", "can't", "won't"
            ]) or any(emoji in text for emoji in ["👎", "❌", "🚫", "😡", "🤢"]):
                return {
                    "value": 2,
                    "confidence": 0.75,
                    "explanation": f"Interpreted '{text}' as low (2/10)"
                }
        
        # For boolean-like scales
        elif min_val == 0 and max_val == 1:
            # True/yes like responses
            if any(phrase in text_lower for phrase in [
                "yes", "true", "correct", "right", "affirmative", "yeah",
                "yep", "yup", "sure", "definitely", "absolutely", "indeed",
                "ok", "okay", "k", "positive", "certainly", "exactly", 
                "precisely", "100%", "totally", "completely", "agreed"
            ]) or any(emoji in text for emoji in ["👍", "✓", "✅", "👌", "🙂", "😊"]):
                return {
                    "value": 1,
                    "confidence": 0.9,
                    "explanation": f"Interpreted '{text}' as yes/true (1)"
                }
                
            # False/no like responses
            if any(phrase in text_lower for phrase in [
                "no", "false", "incorrect", "wrong", "negative", "nah",
                "nope", "not", "never", "disagree", "denied", "rejected",
                "impossible", "nix", "negative", "veto", "refuse", "decline",
                "pass", "don't", "doesn't", "shouldn't", "wouldn't", "can't"
            ]) or any(emoji in text for emoji in ["👎", "❌", "🚫", "😕", "😠", "😡"]):
                return {
                    "value": 0,
                    "confidence": 0.9,
                    "explanation": f"Interpreted '{text}' as no/false (0)"
                }
                
        # Fallback - try to find intensity modifiers
        intensity_modifiers = {
            "extremely": 1.0, "very": 0.9, "highly": 0.9, "super": 0.95,
            "quite": 0.7, "rather": 0.7, "fairly": 0.6, "pretty": 0.65,
            "somewhat": 0.5, "moderately": 0.5, "relatively": 0.55,
            "slightly": 0.3, "a bit": 0.3, "a little": 0.3, "kind of": 0.4,
            "not very": 0.2, "not really": 0.2, "hardly": 0.15,
            "not at all": 0.0, "not": 0.1, "barely": 0.1
        }
        
        # Find modifiers in text
        for modifier, intensity in intensity_modifiers.items():
            if modifier in text_lower:
                # Scale the intensity to the provided range
                range_size = max_val - min_val
                value = min_val + (range_size * intensity)
                # Round to nearest integer if scale appears to use integers
                if min_val.is_integer() and max_val.is_integer() and range_size <= 10:
                    value = round(value)
                return {
                    "value": value,
                    "confidence": 0.7,
                    "explanation": f"Interpreted '{text}' with modifier '{modifier}' as {value}"
                }
                
        # Check for profanity/strong language - often indicates strong feelings
        profanity_indicators = ["fuck", "fucking", "damn", "shit", "bullshit", "crap", "wtf"]
        if any(word in text_lower for word in profanity_indicators):
            # Determine if it's positive or negative profanity
            negative_indicators = ["not", "don't", "no", "hate", "bad", "waste", "stupid", "ridiculous"]
            if any(word in text_lower for word in negative_indicators):
                # Negative with profanity = very low
                value = min_val
            else:
                # Positive with profanity = very high
                value = max_val
            return {
                "value": value,
                "confidence": 0.8,
                "explanation": f"Interpreted strong language in '{text}' as {value}"
            }
        
        # No semantic interpretation found
        return {
            "value": None,
            "confidence": 0.0,
            "explanation": "No semantic interpretation found"
        }
        
    def extract_salary(self, text: str) -> Dict[str, Any]:
        """
        Extract salary information from text
        
        Args:
            text: The text to extract salary from
            
        Returns:
            Dictionary with extracted salary and confidence
        """
        import re
        
        text_lower = text.lower()
        
        # Check for minimum wage references
        if "minimum wage" in text_lower or "min wage" in text_lower:
            # UK minimum wage is approximately £20,000 annually
            uk_min_wage = 20000
            
            # Look for specific UK locations to adjust
            if "london" in text_lower:
                # London has higher wages - adjust upward
                return {
                    "value": 25000,
                    "confidence": 0.8,
                    "explanation": "Interpreted as London minimum wage (approximated as £25,000 annually)"
                }
            elif "bristol" in text_lower or "manchester" in text_lower or "birmingham" in text_lower:
                # Major UK cities
                return {
                    "value": 22000,
                    "confidence": 0.8,
                    "explanation": f"Interpreted as {text_lower.split()[0]} minimum wage (approximated as £22,000 annually)"
                }
            else:
                # Generic UK minimum wage
                return {
                    "value": uk_min_wage,
                    "confidence": 0.8,
                    "explanation": "Interpreted as UK minimum wage (approximated as £20,000 annually)"
                }
                
        # Look for hourly wages and convert to annual
        hourly_match = re.search(r'(\d+)(?:\.\d+)?\s*(?:£|$|pounds?|gbp|usd|\bper hour|\ban hour|\bhourly\b)', text_lower)
        if hourly_match:
            hourly_rate = float(hourly_match.group(1))
            # Convert to annual (40 hours * 52 weeks)
            annual_salary = hourly_rate * 40 * 52
            return {
                "value": annual_salary,
                "confidence": 0.85,
                "explanation": f"Converted hourly rate of {hourly_rate} to annual salary of {annual_salary:.0f}"
            }
            
        # Look for currency symbols followed by numbers
        currency_regex = r'[\$£€¥](\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
        currency_matches = re.findall(currency_regex, text)
        
        if currency_matches:
            # Remove commas and convert to float
            value = float(currency_matches[0].replace(',', ''))
            return {
                "value": value,
                "confidence": 0.9,
                "explanation": f"Found salary value {value} with currency symbol."
            }
            
        # Look for number followed by 'k' for thousands
        k_regex = r'(\d+)k\b'
        k_matches = re.findall(k_regex, text, re.IGNORECASE)
        
        if k_matches:
            value = float(k_matches[0]) * 1000
            return {
                "value": value,
                "confidence": 0.85,
                "explanation": f"Found salary {k_matches[0]}k, interpreted as {value}."
            }
            
        # Fall back to general number extraction
        return self.extract_number(text)

# --- OST Service Class ---

class OSTService:
    """Service for OST functionality - resume parsing, user preferences, and job evaluation"""
    
    def __init__(self):
        """Initialize OST service with necessary components"""
        # Import OST modules - defer until runtime to avoid circular imports
        success, genai_module = import_ost_modules()
        self.genai = genai_module  # Store for use in other methods
        
        self.mongodb_util = MongoDBUtility()
        
        # Initialize logger
        self.logger = logging.getLogger(__name__)
        
        # Initialize provider manager and ReAct reasoner
        self.provider_manager = ProviderManager()
        self.llm_model = self.provider_manager.get_provider().get_chat_model()
        
        # Create adapter for the model
        self.model_adapter = ModelAdapter(self.llm_model)
        
        # Initialize tool executor with value extraction tools
        self.tool_executor = ToolExecutor()
        self._register_interpretation_tools()
        
        # Initialize ReAct reasoner with the adapter
        self.react_reasoner = ReActReasoner(
            model=self.model_adapter,  # Use the adapter instead of the raw model
            name="Value Interpreter",
            tools=self.tool_executor.get_tool_specs(),
            max_iterations=3,
            stop_at_answer=True
        )
        
        # Setup AI model if API key is available
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key and self.genai:
            self.genai.configure(api_key=api_key)
            self.ai_model = RateLimitedAPI()
            self.ai_model.model = self.genai.GenerativeModel("gemini-1.5-flash")
        else:
            if not self.genai:
                logger.warning("Genai module not available")
            else:
                logger.warning("GEMINI_API_KEY not found in environment variables")
            self.ai_model = None
        
        # Load or define default workflow config (needed for variable schemas)
        # In a real app, load this from a file or DB
        standard_variables = [
            {"key": "min_salary", "type": "number", "min": 0, "max": 10000000, "description": "Minimum acceptable annual salary"},
            {"key": "compensation_weight", "type": "number", "min": 1, "max": 5, "description": "Importance of compensation (1-5)"},
            {"key": "career_growth_weight", "type": "number", "min": 1, "max": 5, "description": "Importance of career growth (1-5)"},
            {"key": "work_life_balance_weight", "type": "number", "min": 1, "max": 5, "description": "Importance of work-life balance (1-5)"},
            {"key": "risk_tolerance", "type": "number", "min": 1, "max": 10, "description": "Willingness to wait for better offers (1-10)"},
            {"key": "job_search_urgency", "type": "number", "min": 1, "max": 10, "description": "Urgency to find a new job (1-10)"}
            # Add other variables matching main.py's setup_resume_workflow if needed
        ]
        # Fix: Initialize WorkflowConfig properly without arguments
        self.workflow_config = WorkflowConfig()
        self.workflow_config.workflow_id = "ost_onboarding"
        self.workflow_config.variables = standard_variables
        self.workflow_config.confidence_threshold = 0.7
        self.workflow_config.max_followups = 2
        
        # Pre-build schema map for quick lookup
        self.variable_schema_map = {var['key']: var for var in self.workflow_config.variables}
    
    def _register_interpretation_tools(self):
        """Register value extraction tools with the tool executor"""
        extractor = ValueExtractorTool()
        
        self.tool_executor.register_tool(
            name="extract_number",
            func=extractor.extract_number,
            description="Extract a numerical value from text, with optional range validation",
            parameter_descriptions={
                "text": "The text to extract a number from",
                "min_val": "Optional minimum allowed value",
                "max_val": "Optional maximum allowed value"
            }
        )
        
        self.tool_executor.register_tool(
            name="extract_salary",
            func=extractor.extract_salary,
            description="Extract salary information from text",
            parameter_descriptions={
                "text": "The text to extract salary from"
            }
        )
        
        self.tool_executor.register_tool(
            name="extract_salary_by_role",
            func=self._extract_salary_by_role,
            description="Extract salary information based on job role and location",
            parameter_descriptions={
                "role": "The job role or title mentioned",
                "location": "The location mentioned (country, city)",
                "experience_level": "Experience level (entry, junior, mid, senior, lead)",
                "industry": "Optional industry context"
            }
        )
        
        self.tool_executor.register_tool(
            name="interpret_importance",
            func=extractor.interpret_scale_value,
            description="Interpret linguistic descriptions of importance or ratings",
            parameter_descriptions={
                "text": "The text to interpret",
                "min_val": "Minimum scale value",
                "max_val": "Maximum scale value"
            }
        )

    def _extract_salary_by_role(self, role: str, location: str = "UK", 
                                experience_level: str = "mid", industry: str = "technology") -> Dict[str, Any]:
        """
        Extract salary information based on job role and location
        
        Args:
            role: The job role or title
            location: The location (country, city)
            experience_level: Experience level (entry, junior, mid, senior, lead)
            industry: Industry context
            
        Returns:
            Dictionary with salary estimate, confidence and explanation
        """
        # Normalize inputs to lowercase
        role = role.lower()
        location = location.lower()
        experience_level = experience_level.lower()
        industry = industry.lower()
        
        # Default base salaries for UK tech industry by experience level
        base_salaries = {
            "entry": 25000,
            "junior": 35000,
            "mid": 50000,
            "senior": 70000,
            "lead": 90000,
            "cto": 110000,
            "director": 100000,
            "vp": 120000,
            "executive": 150000
        }
        
        # Location multipliers (UK average = 1.0)
        location_multipliers = {
            "london": 1.3,
            "manchester": 1.1,
            "birmingham": 1.05,
            "bristol": 1.1,
            "edinburgh": 1.1,
            "glasgow": 1.05,
            "leeds": 1.05,
            "uk": 1.0,
            "united kingdom": 1.0,
            "england": 1.0,
            "scotland": 1.0,
            "wales": 0.95,
            "northern ireland": 0.95,
            "remote": 1.0
        }
        
        # Role-specific adjustments relative to generic software engineer
        role_multipliers = {
            "software engineer": 1.0,
            "software developer": 1.0,
            "engineer": 1.0,
            "developer": 1.0,
            "web developer": 0.95,
            "frontend": 1.0,
            "backend": 1.05,
            "fullstack": 1.05,
            "devops": 1.1,
            "sre": 1.15,
            "data scientist": 1.1,
            "data engineer": 1.05,
            "machine learning": 1.15,
            "ai": 1.2,
            "product manager": 1.1,
            "project manager": 1.0,
            "designer": 0.9,
            "ux": 0.95,
            "ui": 0.9,
            "qa": 0.85,
            "test": 0.85,
            "security": 1.1,
            "analyst": 0.9,
            "admin": 0.8,
            "support": 0.75,
            "marketing": 0.85,
            "sales": 0.85
        }
        
        # Industry multipliers
        industry_multipliers = {
            "technology": 1.0,
            "finance": 1.2,
            "banking": 1.2,
            "healthcare": 0.9,
            "education": 0.8,
            "government": 0.85,
            "retail": 0.85,
            "ecommerce": 0.95,
            "manufacturing": 0.9,
            "consulting": 1.1,
            "agency": 0.9,
            "startup": 0.9  # Lower base but often with equity
        }
        
        # Determine base salary by experience level
        base_salary = base_salaries.get(experience_level, base_salaries["mid"])
        
        # Find matching location multiplier (default to UK average)
        location_multiplier = 1.0
        for loc, mult in location_multipliers.items():
            if loc in location:
                location_multiplier = mult
                break
        
        # Find role multiplier
        role_multiplier = 1.0
        for r, mult in role_multipliers.items():
            if r in role:
                role_multiplier = mult
                break
        
        # Find industry multiplier
        industry_multiplier = industry_multipliers.get(industry, 1.0)
        
        # Calculate final salary
        estimated_salary = base_salary * location_multiplier * role_multiplier * industry_multiplier
        
        # Round to nearest thousand
        estimated_salary = round(estimated_salary / 1000) * 1000
        
        # Determine confidence based on how specific the match was
        confidence = 0.7  # Default confidence
        
        # Better role match = higher confidence
        exact_role_match = any(r == role for r in role_multipliers.keys())
        if exact_role_match:
            confidence += 0.1
        
        # Location specificity increases confidence
        if location in location_multipliers and location != "uk" and location != "united kingdom":
            confidence += 0.05
        
        # Experience level specificity increases confidence
        if experience_level in base_salaries:
            confidence += 0.05
        
        # Cap confidence at 0.9
        confidence = min(confidence, 0.9)
        
        explanation = f"Estimated {experience_level} {role} salary in {location}: £{estimated_salary:,.0f}"
        
        return {
            "value": estimated_salary,
            "confidence": confidence,
            "explanation": explanation
        }

    # --- Resume Processing --- 

    async def process_resume_and_start_conversation(self, session_id: str, file_content: str) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Parses resume, generates questions, and yields updates via generator.
        Initializes conversation state.
        """
        try:
            yield {"type": "status", "status": "processing", "step": "pdf_parsing", "message": "Parsing PDF content"}
            
            # Decode base64 content
            pdf_bytes = base64.b64decode(file_content)
            reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
            resume_text = "".join(page.extract_text() for page in reader.pages)
            
            yield {"type": "status", "status": "processing", "step": "job_field_extraction", "message": "Extracting job field..."}
            job_field = await self._extract_job_field(resume_text)
            
            yield {"type": "status", "status": "processing", "step": "question_generation", "message": f"Generating questions for {job_field}..."}
            questions = await self._generate_questions(resume_text, job_field)
            
            # Initialize state for this session
            initial_state = {
                "job_field": job_field,
                "questions": questions, # List of {"variable": ..., "question": ...}
                "current_question_index": 0,
                "user_data": [],
                "conversation_history": [],
                "current_responses": [],  # For storing responses to current question
                "current_followup_count": 0,  # Track follow-ups for current question
                "variable_schema_map": self.variable_schema_map, # Share schema map
                "confidence_threshold": self.workflow_config.confidence_threshold,
                "max_followups": self.workflow_config.max_followups
            }
            update_conversation_state(session_id, initial_state)
            
            yield {"type": "analysis_complete", "job_field": job_field, "questions": questions}
            
            # Ask the first question
            if questions:
                 yield {"type": "next_question", "variable": questions[0]["variable"], "question": questions[0]["question"]}
            else:
                 yield {"type": "error", "message": "Could not generate questions."}
                 clear_conversation_state(session_id)

        except Exception as e:
            logger.exception(f"Error processing resume for session {session_id}: {e}")
            yield {"type": "error", "message": f"Error processing resume: {str(e)}"}
            clear_conversation_state(session_id)

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
        """Generate personalized questions based on resume and job field"""
        # For now, return standard questions
        # In real implementation, would use AI to generate personalized questions
        return [
            {"variable": "min_salary", "question": "What is your minimum acceptable salary?"},
            {"variable": "work_life_balance_weight", "question": "How important is work-life balance to you (1-5)?"},
            {"variable": "compensation_weight", "question": "How important is compensation to you (1-5)?"},
            {"variable": "career_growth_weight", "question": "How important is career growth to you (1-5)?"},
            {"variable": "risk_tolerance", "question": "How willing are you to wait for better offers (1-10)?"}
        ]

    # --- Handle User Answers ---

    async def handle_user_answer(self, session_id: str, variable: str, answer_text: str) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process a user's answer to a question and determine next steps
        """
        state = get_conversation_state(session_id)
        
        try:
            # Store the raw response
            state["current_responses"].append(answer_text)
            
            # Find the schema for this variable
            var_schema = state["variable_schema_map"].get(variable)
            if not var_schema:
                yield {"type": "error", "message": f"Unknown variable: {variable}"}
                return
                
            # Get current question for context
            current_question = next((q for q in state["questions"] if q["variable"] == variable), None)
            if not current_question:
                yield {"type": "error", "message": f"No question found for variable: {variable}"}
                return
            
            # Send status update
            yield {"type": "status", "status": "interpreting", "message": f"Interpreting answer for {variable}..."}
            
            # Use ReAct reasoner to interpret the answer
            var_type = var_schema["type"]
            var_min = var_schema.get("min")
            var_max = var_schema.get("max")
            
            # Construct detailed context for the reasoner
            context = {
                "variable": variable,
                "variable_type": var_type,
                "min_value": var_min,
                "max_value": var_max,
                "question": current_question["question"],
                "answer": answer_text,
                "description": var_schema.get("description", "")
            }
            
            # Process with ReAct reasoner
            interpretation = await self._interpret_answer_with_react(context)
            
            # Extract the interpreted value and confidence
            interpreted_value = interpretation.get("value")
            confidence = interpretation.get("confidence", 0)
            reasoning = interpretation.get("explanation", "No explanation provided.")
            
            # Update state
            update_conversation_state(session_id, {"current_responses": []})
            
            # Check confidence against threshold
            if confidence >= state["confidence_threshold"]:
                # Confidence is high enough to accept the answer
                # Record the answer
                state["user_data"].append({
                    "variable": variable,
                    "question": current_question["question"],
                    "answer": answer_text,
                    "interpreted_value": interpreted_value,
                    "confidence": confidence
                })
                
                # Send the interpretation result to the client
                yield {
                    "type": "interpretation_result", 
                    "variable": variable, 
                    "interpreted_value": interpreted_value,
                    "confidence": confidence,
                    "reasoning": reasoning
                }
                
                # Move to next question or finalize
                state["current_question_index"] += 1
                state["current_followup_count"] = 0  # Reset follow-up count
                
                if state["current_question_index"] < len(state["questions"]):
                    # There are more questions to ask
                    next_q = state["questions"][state["current_question_index"]]
                    yield {
                        "type": "next_question", 
                        "variable": next_q["variable"], 
                        "question": next_q["question"]
                    }
                else:
                    # All questions have been answered, finalize the profile
                    profile = await self._finalize_user_profile(session_id)
                    yield {"type": "profile_created", "profile": profile}
            else:
                # Confidence is too low, ask a follow-up question
                state["current_followup_count"] += 1
                
                if state["current_followup_count"] > state["max_followups"]:
                    # Too many follow-ups, use a reasonable default value
                    
                    # Choose better defaults based on variable type
                    default_value = var_min if var_min is not None else 3  # General default
                    
                    # Special handling for salary - use a reasonable minimum wage
                    if variable == "min_salary":
                        # UK minimum wage equivalent to about £20,000 annually
                        default_value = 20000
                    elif "_weight" in variable:
                        # For weights, use a middle value
                        default_value = 3
                    
                    state["user_data"].append({
                        "variable": variable,
                        "question": current_question["question"],
                        "answer": answer_text,
                        "interpreted_value": default_value,
                        "confidence": 0.5,  # Low confidence but proceeding
                        "is_default": True
                    })
                    
                    yield {
                        "type": "interpretation_result", 
                        "variable": variable, 
                        "interpreted_value": default_value,
                        "confidence": 0.5,
                        "reasoning": "Using a reasonable default value after multiple attempts."
                    }
                    
                    # Move to next question
                    state["current_question_index"] += 1
                    state["current_followup_count"] = 0  # Reset follow-up count
                    
                    if state["current_question_index"] < len(state["questions"]):
                        next_q = state["questions"][state["current_question_index"]]
                        yield {
                            "type": "next_question", 
                            "variable": next_q["variable"], 
                            "question": next_q["question"]
                        }
                    else:
                        # All questions answered
                        profile = await self._finalize_user_profile(session_id)
                        yield {"type": "profile_created", "profile": profile}
                else:
                    # Generate a follow-up question based on the context
                    followup_question = await self._generate_followup_question(
                        variable, 
                        current_question["question"], 
                        answer_text, 
                        var_schema
                    )
                    
                    yield {
                        "type": "followup_question", 
                        "variable": variable, 
                        "question": followup_question
                    }
                    
        except Exception as e:
            logger.exception(f"Error handling answer for session {session_id}: {e}")
            yield {"type": "error", "message": f"Error processing your answer: {str(e)}"}
    
    async def _interpret_answer_with_react(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use the ReAct reasoner to interpret a user's answer
        
        Args:
            context: Dictionary with variable information and the user's answer
            
        Returns:
            Dictionary with interpreted value, confidence, and explanation
        """
        try:
            variable = context["variable"]
            var_type = context["variable_type"]
            min_val = context.get("min_value")
            max_val = context.get("max_value")
            answer = context["answer"]
            
            # Construct the query for the reasoner with more explicit instructions
            query = f"""
            Extract a {var_type} value from this user's answer: "{answer}"
            
            Variable: {variable}
            Type: {var_type}
            """
            
            if min_val is not None:
                query += f"\nMinimum value: {min_val}"
            
            if max_val is not None:
                query += f"\nMaximum value: {max_val}"
            
            # Add examples of using tools based on the variable type
            if variable == "min_salary":
                query += """
                IMPORTANT: You MUST use the extract_salary_by_role tool if a specific number isn't mentioned.
                
                Example:
                If user says "lead software engineer in London", you should:
                1. Think: "I need to estimate salary for a lead software engineer in London"
                2. Act: Use extract_salary_by_role tool
                3. Send parameters: {"role": "software engineer", "location": "London", "experience_level": "lead"}
                4. Get result and return it as your answer
                
                DO NOT answer with None. ALWAYS use a tool to get a specific number value.
                """
            elif "_weight" in variable:
                query += """
                IMPORTANT: You MUST use the interpret_importance tool when interpreting importance statements.
                
                Example:
                If user says "very important to me", you should:
                1. Think: "I need to interpret how important this is on the scale"
                2. Act: Use interpret_importance tool
                3. Send parameters: {"text": "very important to me", "min_val": 1, "max_val": 5}
                4. Get result and return it as your answer
                
                DO NOT answer with None. ALWAYS use a tool to get a specific number value.
                """
            
            # Add job context from answer
            roles = ["software engineer", "developer", "frontend", "backend", "fullstack", 
                    "devops", "data scientist", "product manager", "designer", "tester"]
            experience_levels = ["junior", "entry", "mid", "senior", "lead", "principal", "staff"]
            
            detected_role = None
            for role in roles:
                if role in answer.lower():
                    detected_role = role
                    break
            
            detected_level = None
            for level in experience_levels:
                if level in answer.lower():
                    detected_level = level
                    break
            
            if detected_role:
                query += f"\nDetected job role: {detected_role}"
            
            if detected_level:
                query += f"\nDetected experience level: {detected_level}"
            
            # Add location context if mentioned
            locations = ["london", "manchester", "birmingham", "bristol", "edinburgh", "glasgow",
                       "leeds", "uk", "united kingdom", "england", "scotland", "wales"]
            
            detected_location = None
            for location in locations:
                if location in answer.lower():
                    detected_location = location
                    break
            
            if detected_location:
                query += f"\nDetected location: {detected_location}"
                
            # Execute reasoning
            self.logger.info(f"Running ReAct reasoner for {variable} interpretation with enhanced prompt")
            
            # Create a custom context for the reasoner
            reasoning_context = json.dumps({
                **context,
                "example_format": {
                    "value": 90000,
                    "confidence": 0.85,
                    "explanation": "Estimated salary for a lead software engineer in the UK"
                }
            })
            
            result = await self.react_reasoner.reason(
                {"query": query, "context": reasoning_context},
                self.tool_executor
            )
            
            # Debug the returned result
            self.logger.info(f"ReAct reasoner result: {result}")
            
            # Check if the reasoner found an answer
            if result.get("answer"):
                try:
                    answer_text = result["answer"].strip()
                    self.logger.info(f"Raw answer from reasoner: {answer_text}")
                    
                    # If answer is 'None', use the observations from tool calls instead
                    if answer_text == "None" or not answer_text:
                        self.logger.info("Answer is None, looking for observations from tool calls")
                        
                        # Check if there are useful observations from tool calls
                        observations = result.get("observations", [])
                        if observations:
                            # Use the last observation as it's the most relevant
                            last_observation = observations[-1]
                            self.logger.info(f"Using tool observation: {last_observation}")
                            
                            # Try to parse JSON from the observation
                            try:
                                import re
                                json_match = re.search(r'\{.*\}', last_observation, re.DOTALL)
                                if json_match:
                                    json_data = json.loads(json_match.group(0))
                                    self.logger.info(f"Successfully parsed JSON from observation: {json_data}")
                                    return json_data
                            except Exception as e:
                                self.logger.warning(f"Failed to parse JSON from observation: {e}")
                    
                    # The rest of the parsing logic remains unchanged...
                    
                    # First try to parse JSON directly
                    try:
                        if "{" in answer_text and "}" in answer_text:
                            import re
                            json_match = re.search(r'\{.*\}', answer_text, re.DOTALL)
                            if json_match:
                                try:
                                    json_data = json.loads(json_match.group(0))
                                    self.logger.info(f"Successfully parsed JSON from answer: {json_data}")
                                    return json_data
                                except:
                                    pass
                    except Exception as e:
                        self.logger.warning(f"Failed to parse JSON: {e}")
                    
                    # Try to extract numeric value and confidence from the text
                    import re
                    value_match = re.search(r'(?:value|number|salary|amount)[:\s]+([0-9,.]+[kK]?)', answer_text, re.IGNORECASE)
                    conf_match = re.search(r'(?:confidence|certainty)[:\s]+([0-9.]+)', answer_text, re.IGNORECASE)
                    
                    if value_match:
                        # Extract value, remove commas
                        value_str = value_match.group(1).replace(',', '')
                        # Handle 'k' suffix for thousands
                        if value_str.lower().endswith('k'):
                            value = float(value_str[:-1]) * 1000
                        else:
                            value = float(value_str)
                        
                        # Extract confidence if available, default to 0.8
                        confidence = float(conf_match.group(1)) if conf_match else 0.8
                        
                        # Construct response
                        return {
                            "value": value,
                            "confidence": confidence,
                            "explanation": f"Extracted value {value} from reasoner's answer"
                        }
                    
                    # Look for any number in the text (even without a label)
                    numbers = re.findall(r'([0-9,.]+[kK]?)', answer_text)
                    if numbers:
                        # Process the first number found
                        value_str = numbers[0].replace(',', '')
                        # Handle 'k' suffix for thousands
                        if value_str.lower().endswith('k'):
                            value = float(value_str[:-1]) * 1000
                        else:
                            value = float(value_str)
                        
                        return {
                            "value": value,
                            "confidence": 0.7,
                            "explanation": f"Extracted value {value} from reasoner's answer"
                        }
                    
                    # Rest of parsing logic remains the same...
                    
                except Exception as e:
                    self.logger.error(f"Error parsing reasoner answer: {e}")
            
            # If we've detected a role and location from the query but the reasoner failed,
            # try using our extraction tool directly
            if detected_role and detected_location:
                self.logger.info(f"Using extract_salary_by_role tool directly with detected role and location")
                
                result = self._extract_salary_by_role(
                    role=detected_role,
                    location=detected_location,
                    experience_level=detected_level or "mid"
                )
                
                self.logger.info(f"Direct role-based extraction: {result}")
                return result
            
            # If the reasoner didn't provide a useful result, try direct tools
            self.logger.warning(f"Reasoner failed to provide a valid answer for {variable}. Using direct extraction.")
            
            # Create extractor
            extractor = ValueExtractorTool()
            
            # Use appropriate extraction method
            if variable == "min_salary":
                direct_result = extractor.extract_salary(answer)
                self.logger.info(f"Direct salary extraction: {direct_result}")
                
                # If we got a valid result, return it
                if direct_result.get("value") is not None:
                    return direct_result
                
                # For salary without specific context, use our direct tool
                self.logger.info("Using generic UK software professional salary estimate")
                return self._extract_salary_by_role(
                    role="software engineer",
                    location="UK",
                    experience_level="mid"
                )
            else:
                direct_result = extractor.extract_number(answer, min_val, max_val)
                self.logger.info(f"Direct number extraction: {direct_result}")
                
                # If we got a valid result, return it
                if direct_result.get("value") is not None:
                    return direct_result
                
                # Default to midpoint
                default_val = (min_val + max_val) / 2 if min_val is not None and max_val is not None else 3
                return {
                    "value": default_val,
                    "confidence": 0.5,
                    "explanation": f"Using default value {default_val}"
                }
                
        except Exception as e:
            self.logger.exception(f"Error in ReAct interpretation: {e}")
            
            # Final fallback with sensible defaults
            if variable == "min_salary":
                # Software professional average
                return {
                    "value": 50000,
                    "confidence": 0.5,
                    "explanation": f"Using average software professional salary due to error: {str(e)}"
                }
            elif "_weight" in variable:
                # Middle value for weights
                return {
                    "value": 3,
                    "confidence": 0.5,
                    "explanation": f"Using middle value (3) as default due to error: {str(e)}"
                }
            else:
                # Generic fallback
                return {
                    "value": min_val if min_val is not None else 3,
                    "confidence": 0.5,
                    "explanation": f"Using default value due to error: {str(e)}"
                }
    
    async def _generate_followup_question(
        self, 
        variable: str, 
        original_question: str, 
        answer: str, 
        var_schema: Dict[str, Any]
    ) -> str:
        """Generate a follow-up question to clarify an ambiguous answer"""
        
        # For specific variable types, use targeted follow-ups
        if variable == "min_salary":
            return f"I need a specific number for your minimum acceptable salary. Could you please provide that?"
        
        if "_weight" in variable:
            return f"Please rate the importance on a scale of 1-5, where 1 is least important and 5 is most important."
        
        # Generic follow-up
        min_val = var_schema.get("min")
        max_val = var_schema.get("max")
        
        if min_val is not None and max_val is not None:
            return f"Please provide a number between {min_val} and {max_val} for this question."
        
        return f"I didn't understand your answer. Could you please provide a clearer response to: {original_question}"

    async def _finalize_user_profile(self, session_id: str) -> Dict[str, Any]:
        """Convert user data into a finalized user profile"""
        state = get_conversation_state(session_id)
        
        # Extract data into a flat dictionary
        user_prefs = {}
        for item in state["user_data"]:
            user_prefs[item["variable"]] = item["interpreted_value"]
        
        # Create a user ID
        user_id = str(uuid.uuid4())
        
        # Create a profile object
        profile = {
            "user_id": user_id,
            "job_field": state["job_field"],
            "preferences": user_prefs,
            "created_at": datetime.now().isoformat()
        }
        
        # Save to database (in a real app)
        # self.mongodb_util.save_document("user_profiles", profile)
        
        return profile

    # --- Other API Methods ---
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a user profile from the database"""
        # Mock implementation for now
        return {
            "user_id": user_id,
            "job_field": "software_engineering",
            "preferences": {
                "min_salary": 80000,
                "work_life_balance_weight": 4,
                "compensation_weight": 3,
                "career_growth_weight": 5,
                "risk_tolerance": 6
            },
            "created_at": datetime.now().isoformat()
        }
        
    async def evaluate_offer(self, user_id: str, offer: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate a job offer against a user's preferences"""
        # Get user profile
        profile = await self.get_user_profile(user_id)
        
        if not profile:
            return {"error": f"User profile not found: {user_id}"}
        
        # Extract preferences
        prefs = profile.get("preferences", {})
        
        # Extract offer details
        salary = offer.get("salary", 0)
        work_life_balance = offer.get("work_life_balance", 3)
        growth_potential = offer.get("growth_potential", 3)
        
        # Calculate score components
        min_salary = prefs.get("min_salary", 0)
        salary_score = 0 if salary < min_salary else min(10, (salary - min_salary) / 10000)
        
        wlb_weight = prefs.get("work_life_balance_weight", 3)
        wlb_score = work_life_balance * wlb_weight / 5 * 10
        
        growth_weight = prefs.get("career_growth_weight", 3)
        growth_score = growth_potential * growth_weight / 5 * 10
        
        # Calculate weighted total score
        total_score = (salary_score + wlb_score + growth_score) / 3
        
        # Generate recommendation
        recommendation = "accept" if total_score >= 7 else "consider" if total_score >= 5 else "decline"
        
        return {
            "user_id": user_id,
            "offer_evaluation": {
                "total_score": round(total_score, 1),
                "salary_score": round(salary_score, 1),
                "work_life_balance_score": round(wlb_score, 1),
                "growth_score": round(growth_score, 1),
                "recommendation": recommendation,
                "explanation": f"This offer scores {round(total_score, 1)}/10 based on your preferences."
            },
            "offer": offer,
            "user_preferences": prefs
        } 