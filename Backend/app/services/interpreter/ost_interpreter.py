"""
OST Interpreter Module - Extracted from main.py with enhanced functionality

This module provides advanced reasoning for interpreting user responses during the onboarding flow.
It uses the same AI reasoning logic from main.py but optimized for the websocket flow.
"""

import asyncio
import os
import logging
from typing import Tuple, Any, Dict, List, Optional
import google.generativeai as genai
from ..ost_service import RateLimitedAPI

# Configure logging
logger = logging.getLogger(__name__)

# Get API key from environment variables
api_key = os.getenv("GEMINI_API_KEY")

# Initialize AI model
try:
    if api_key:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        ai_model = RateLimitedAPI()
        ai_model.model = model
    else:
        logger.warning("GEMINI_API_KEY not found in environment variables")
        ai_model = None
except Exception as e:
    logger.error(f"Error initializing AI model: {e}")
    ai_model = None


class ReasoningHistory:
    """
    Tracks reasoning history for specific variables (from main.py)
    """
    def __init__(self):
        self.history = {}  # variable -> list of reasoning steps
        self.last_responses = {}  # variable -> most recent response
        
    def add(self, variable: str, response: Any, confidence: float):
        """Add a reasoning step to the history"""
        if variable not in self.history:
            self.history[variable] = []
            
        self.history[variable].append({
            "response": response,
            "confidence": confidence,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        # Store latest response text for future use
        self.last_responses[variable] = str(response)
        
    def get_last_confidence(self, variable: str) -> float:
        """Get the confidence of the most recent reasoning step for a variable"""
        if variable in self.history and self.history[variable]:
            return self.history[variable][-1]["confidence"]
        return 0.0
        
    def get_last_response(self, variable: str) -> Any:
        """Get the most recent response for a variable"""
        if variable in self.history and self.history[variable]:
            return self.history[variable][-1]["response"]
        return None


# Standard variable schemas
STANDARD_SCHEMAS = {
    "min_salary": {
        "min": 0, 
        "max": 500000, 
        "type": "number",
        "description": "Minimum acceptable annual salary"
    },
    "compensation_weight": {
        "min": 1, 
        "max": 5, 
        "type": "number",
        "description": "Importance of compensation (1=unimportant, 5=extremely important)"
    },
    "career_growth_weight": {
        "min": 1, 
        "max": 5, 
        "type": "number",
        "description": "Importance of career growth (1=unimportant, 5=extremely important)"
    },
    "work_life_balance_weight": {
        "min": 1, 
        "max": 5, 
        "type": "number",
        "description": "Importance of work-life balance (1=unimportant, 5=extremely important)"
    },
    "risk_tolerance": {
        "min": 1, 
        "max": 10, 
        "type": "number",
        "description": "Willingness to wait for better offers (1=low, 10=high)"
    },
    "job_search_urgency": {
        "min": 1, 
        "max": 10, 
        "type": "number",
        "description": "Urgency to find a new job (1=not urgent, 10=very urgent)"
    }
}

# Singleton for tracking reasoning across requests
reasoning_history = ReasoningHistory()


async def interpret_response(
    variable: str, 
    question: str, 
    responses: List[str], 
    schema: Dict[str, Any], 
    job_field: str, 
    conversation_history: List[Dict[str, Any]]
) -> Tuple[float, float, str]:
    """
    Interprets user responses for variables using the same logic from main.py
    
    Args:
        variable: The variable being answered (e.g., 'min_salary')
        question: The original question text
        responses: List of user responses for this question (including follow-ups)
        schema: Schema defining the variable (min, max, type, description)
        job_field: The job field extracted from resume
        conversation_history: Full conversation history for context
        
    Returns:
        Tuple of (interpreted_value, confidence, reasoning)
    """
    if not ai_model:
        # Fallback for no AI model: simple parsing
        try:
            num = float(responses[-1].replace("k", "000").replace("m", "000000")
                        .replace("£", "").replace("$", "").replace(",", "").strip())
            return max(schema["min"], min(schema["max"], num)), 0.8, f"Parsed number: {num}"
        except (ValueError, IndexError):
            # Couldn't parse as number, return midpoint
            midpoint = (schema["min"] + schema["max"]) / 2
            return midpoint, 0.5, f"Could not parse response as number, using default value: {midpoint}"

    # Standard variables might need special handling
    if variable == "min_salary":
        # Special salary handling prompt
        prompt = construct_salary_prompt(variable, question, responses, schema, job_field, conversation_history)
    else:
        # Standard prompt for other variables
        prompt = construct_standard_prompt(variable, question, responses, schema, job_field, conversation_history)
        
    try:
        # Make AI call (using asyncio.to_thread for sync RateLimitedAPI)
        ai_response = await asyncio.to_thread(ai_model.generate_content, prompt)
        
        logger.debug(f"AI interpretation response for {variable}: {ai_response.text}")
        
        # Parse response
        number, confidence, reasoning = parse_ai_response(ai_response.text)
        
        if number is not None and confidence is not None:
            # Clamp result to schema bounds
            result = max(schema["min"], min(schema["max"], number))
            
            # Store in reasoning history
            reasoning_history.add(variable, result, confidence)
            
            return result, confidence, reasoning
    except Exception as e:
        logger.exception(f"Error in interpret_response for {variable}: {e}")
    
    # Fallback for errors
    fallback_value = (schema["min"] + schema["max"]) / 2
    fallback_confidence = 0.3
    fallback_reasoning = f"Error in AI interpretation, using default value: {fallback_value}"
    reasoning_history.add(variable, fallback_value, fallback_confidence)
    return fallback_value, fallback_confidence, fallback_reasoning


def construct_salary_prompt(variable, question, responses, schema, job_field, conversation_history):
    """Construct a specialized prompt for salary interpretation"""
    history_text = "\n".join([f"Q: {h['question']}\nA: {h['response']}" 
                             for h in conversation_history[-5:]])
    
    # Get previous reasoning for this variable if available
    prev_reasoning = ""
    for h in conversation_history:
        if h.get("variable") == variable and h.get("reasoning"):
            prev_reasoning += f"Previous interpretation: {h.get('reasoning')}\n"
    
    # Construct a more comprehensive prompt with meta-reasoning guidance
    return f"""
    You're part of an Optimal Stopping Theory system analyzing job seeker preferences.
    Apply sophisticated meta-reasoning to interpret the user's salary expectations.
    
    Question: '{question}'
    User responses: {responses}
    Job field: '{job_field}'
    
    Conversation history:
    {history_text}
    
    {prev_reasoning}
    
    USE THE META-REASONING APPROACH:
    1. First, identify the type of response (direct number, hourly rate, description, etc.)
    2. For hourly rates: Convert to annual salary (hourly * 40 hours * 52 weeks)
    3. For vague terms like "minimum wage": Use local context + job field norms
       - UK minimum wage is roughly £20,000 annually 
       - Bristol, UK specific context should be considered
       - "Min wage Bristol" for software_engineering could be entry-level rate (~£25,000-£30,000)
    4. Compare with standard entry-level salaries for {job_field}
    5. Provide detailed reasoning explaining your conversion and interpretation
    
    The expected output value should be in numerical form only (annual salary).
    
    Output this exact format:
    Number: [interpreted_annual_salary]
    Confidence: [confidence_score_0_to_1]
    Reasoning: [detailed_step_by_step_reasoning_for_your_calculation]
    """


def construct_standard_prompt(variable, question, responses, schema, job_field, conversation_history):
    """Construct a general prompt for other variables"""
    history_text = "\n".join([f"Q: {h['question']}\nA: {h['response']}" 
                             for h in conversation_history[-5:]])
    
    return f"""
    Interpret the user's response about {schema.get('description', variable)}.
    Question: '{question}'
    Responses: {responses}
    Job field: '{job_field}'
    
    Conversation history (most recent 5 exchanges):
    {history_text}
    
    Rules:
    - Output a number between {schema["min"]} and {schema["max"]}.
    - For scales (e.g., 1-5, 1-10), map text responses to appropriate values.
    - Consider the context of {job_field} when interpreting vague responses.
    - If the user expresses uncertainty, choose a middle value with lower confidence.
    
    Important: Provide detailed reasoning for your interpretation.
    
    Output this exact format (3 parts):
    Number: [interpreted_number]
    Confidence: [confidence_score_0_to_1]
    Reasoning: [your_detailed_reasoning]
    """


def parse_ai_response(response_text):
    """Parse AI response text into number, confidence and reasoning"""
    # Add debug logging
    logger.debug(f"Parsing AI response: {response_text}")
    
    lines = response_text.strip().split("\n")
    number = confidence = None
    
    current_section = None
    reasoning_lines = []
    
    for line in lines:
        logger.debug(f"Processing line: {line}, current_section: {current_section}")
        if line.startswith("Number:"):
            current_section = "number"
            try:
                number = float(line.split(":", 1)[1].strip())
                logger.debug(f"Extracted number: {number}")
            except ValueError:
                logger.warning(f"Could not parse number from '{line}'")
        elif line.startswith("Confidence:"):
            current_section = "confidence"
            try:
                confidence = float(line.split(":", 1)[1].strip())
                logger.debug(f"Extracted confidence: {confidence}")
            except ValueError:
                logger.warning(f"Could not parse confidence from '{line}'")
        elif line.startswith("Reasoning:"):
            current_section = "reasoning"
            reasoning_part = line.split(":", 1)[1].strip()
            if reasoning_part:  # If there's text after the colon
                reasoning_lines.append(reasoning_part)
                logger.debug(f"Started reasoning with: {reasoning_part}")
        elif current_section == "reasoning":
            reasoning_lines.append(line)
            logger.debug(f"Added to reasoning: {line}")
    
    # If no explicit reasoning section found, try to use everything after confidence
    if not reasoning_lines:
        logger.debug("No explicit reasoning found, looking for implicit reasoning")
        in_reasoning = False
        for line in lines:
            if in_reasoning:
                reasoning_lines.append(line)
                logger.debug(f"Added implicit reasoning: {line}")
            elif line.startswith("Confidence:"):
                in_reasoning = True  # Start capturing everything after confidence as reasoning
    
    reasoning = " ".join(reasoning_lines) if reasoning_lines else "No reasoning provided"
    logger.debug(f"Final reasoning: {reasoning}")
    
    # If no meaningful reasoning was found but we have a number for min_salary, generate basic reasoning
    if reasoning == "No reasoning provided" and number is not None and number > 0:
        if number == 3 and confidence <= 0.5:
            # This is a fallback value, generate better reasoning
            reasoning = f"The response was unclear, so I'm using a default/neutral value of {number}."
        elif confidence >= 0.7:
            # Generate basic reasoning for high confidence values
            reasoning = f"Based on the clear numerical value provided or implied in the response."
    
    # Never return both number and confidence as None, use defaults if needed
    if number is None:
        number = 3
        if confidence is None:
            confidence = 0.5
        reasoning = "Could not determine a specific value from the response. Using a default value."
    
    return number, confidence, reasoning


async def generate_followup_question(
    variable: str, 
    responses: List[str], 
    job_field: str, 
    conversation_history: List[Dict[str, Any]]
) -> str:
    """
    Generate a follow-up question for clarity when confidence is low
    
    Args:
        variable: The variable being answered
        responses: Previous responses for this question
        job_field: The job field
        conversation_history: Full conversation history
        
    Returns:
        Follow-up question text
    """
    if not ai_model:
        # Default follow-up without AI
        if variable == "min_salary":
            return "Could you please provide a specific annual salary number?"
        else:
            return f"Could you please provide a more specific numerical value for {variable}?"
    
    try:
        schema = STANDARD_SCHEMAS.get(variable, {"min": 1, "max": 5, "type": "number"})
        history_text = "\n".join([f"Q: {h['question']}\nA: {h['response']}" 
                                for h in conversation_history[-5:]])
        
        prompt = f"""
        The user's responses for '{variable}' were unclear.
        Previous responses: {responses}
        Job field: '{job_field}'
        Variable description: {schema.get('description', variable)}
        Expected range: {schema["min"]} to {schema["max"]}
        
        Conversation history:
        {history_text}
        
        Generate a clear, concise follow-up question that will help get a more specific response.
        For min_salary, ask for an annual figure if they gave hourly/monthly rates.
        For rating scales, remind them of the scale (e.g., "on a scale of 1-5").
        
        Output ONLY the follow-up question text, nothing else.
        """
        
        response = await asyncio.to_thread(ai_model.generate_content, prompt)
        followup = response.text.strip()
        
        return followup
    except Exception as e:
        logger.exception(f"Error generating follow-up for {variable}: {e}")
        
        # Fallback questions
        if variable == "min_salary":
            return "Could you please provide your minimum acceptable salary as an annual figure?"
        else:
            return f"Could you please provide a more specific numerical value for {variable}?" 