"""
Meta-reasoning agent module - implements agents that analyze and control the reasoning process.
"""

import asyncio
import logging
import time
import numpy as np
from difflib import SequenceMatcher
from typing import Dict, List, Any, Optional, Tuple, Union, Set
from .base_agent import BaseAgent, AIModelInterface

# Configure logging
logger = logging.getLogger(__name__)

class ReasoningHistory:
    """
    A container class to track reasoning history for specific variables.
    """
    def __init__(self):
        self.history: Dict[str, List[Dict[str, Any]]] = {}  # variable -> list of reasoning steps
        self.last_responses: Dict[str, str] = {}  # variable -> most recent response
        
    def add(self, variable: str, response: Any, confidence: float):
        """Add a reasoning step to the history"""
        if variable not in self.history:
            self.history[variable] = []
            
        self.history[variable].append({
            "response": response,
            "confidence": confidence,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        # Store latest response text for similarity comparison
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
        
    def get_similarity(self, variable: str, new_response: str) -> float:
        """Calculate similarity between new response and last response"""
        if variable in self.last_responses:
            return SequenceMatcher(None, self.last_responses[variable], new_response).ratio()
        return 0.0
        
    def get_confidence_progress(self, variable: str) -> float:
        """Calculate confidence improvement between last two steps"""
        if variable in self.history and len(self.history[variable]) >= 2:
            return self.history[variable][-1]["confidence"] - self.history[variable][-2]["confidence"]
        return 1.0  # Default to positive progress for first step
    
    def get_variables(self) -> Set[str]:
        """Get all variables that have been reasoned about"""
        return set(self.history.keys())
    
    def get_total_steps(self) -> int:
        """Get total number of reasoning steps across all variables"""
        return sum(len(steps) for steps in self.history.values())
    
    def get_average_confidence(self) -> float:
        """Get average confidence across all variables"""
        if not self.history:
            return 0.0
        
        confidences = []
        for var in self.history:
            if self.history[var]:
                confidences.append(self.history[var][-1]["confidence"])
        
        return np.mean(confidences) if confidences else 0.0


class MetaReasoningAgent(BaseAgent):
    """
    Monitors and analyzes the reasoning process to prevent inefficient reasoning loops
    and optimize the number of AI calls needed.
    """
    def __init__(self, 
                 ai_model: AIModelInterface, 
                 max_consecutive_calls: int = 5, 
                 max_reasoning_per_variable: int = 3,
                 similarity_threshold: float = 0.8,
                 confidence_threshold: float = 0.7,
                 progress_threshold: float = 0.05):
        """
        Initialize the meta-reasoning agent.
        
        Args:
            ai_model: The AI model interface implementation
            max_consecutive_calls: Maximum number of consecutive calls before analysis
            max_reasoning_per_variable: Maximum reasoning steps per variable
            similarity_threshold: Threshold for detecting circular reasoning
            confidence_threshold: Target confidence threshold
            progress_threshold: Minimum confidence improvement required
        """
        super().__init__(ai_model)
        self.consecutive_calls = 0
        self.max_consecutive_calls = max_consecutive_calls
        self.total_calls = 0
        self.reasoning_history = ReasoningHistory()
        self.max_reasoning_per_variable = max_reasoning_per_variable
        self.last_analysis_time = time.time()
        self.similarity_threshold = similarity_threshold
        self.confidence_threshold = confidence_threshold
        self.progress_threshold = progress_threshold
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generic processing method that handles meta-reasoning.
        This can be used directly or extended by subclasses.
        
        Args:
            input_data: Data to be processed
            
        Returns:
            Processed output
        """
        # Basic implementation - extend in subclasses
        variable = input_data.get("variable")
        prompt = input_data.get("prompt")
        
        if not prompt:
            return {"error": "No prompt provided"}
        
        # Check if we should continue reasoning
        if variable and not self.check_and_handle(variable):
            return {
                "status": "skipped",
                "reason": "Meta-reasoning determined further reasoning is not productive",
                "variable": variable,
                "result": self.get_best_estimate(variable)
            }
        
        # Proceed with AI call
        try:
            response = await self.ai_model.agenerate_content(prompt)
            self.increment()
            
            # Process response
            result = self._extract_result(response)
            
            # Track reasoning if variable provided
            if variable:
                confidence = result.get("confidence", 0.5)
                value = result.get("value")
                self.track_reasoning(variable, value, confidence)
            
            return {
                "status": "success",
                "result": result,
                "variable": variable,
                "meta": {
                    "consecutive_calls": self.consecutive_calls,
                    "total_calls": self.total_calls
                }
            }
        except Exception as e:
            logger.exception(f"Error in MetaReasoningAgent.process: {e}")
            return {"status": "error", "error": str(e), "variable": variable}
    
    def increment(self):
        """Increment both consecutive and total call counters"""
        self.consecutive_calls += 1
        self.total_calls += 1
        logger.debug(f"API Call {self.total_calls} (Consecutive: {self.consecutive_calls}/{self.max_consecutive_calls})")
        
    def reset_consecutive(self):
        """Reset just the consecutive counter (after user input)"""
        self.consecutive_calls = 0
        logger.debug("Reset consecutive API call counter due to user interaction")
    
    def track_reasoning(self, variable: str, response: Any, confidence: float) -> Tuple[Any, float]:
        """Track reasoning history for a specific variable"""
        # Calculate similarity with previous response if it exists
        current_response = str(response)
        similarity = self.reasoning_history.get_similarity(variable, current_response)
        if similarity > 0:
            logger.debug(f"Response similarity for {variable}: {similarity:.2f}")
            
        # Add to history
        self.reasoning_history.add(variable, response, confidence)
        
        return response, confidence
    
    def get_best_estimate(self, variable: str) -> Dict[str, Any]:
        """Get the best estimate so far for a variable"""
        response = self.reasoning_history.get_last_response(variable)
        confidence = self.reasoning_history.get_last_confidence(variable)
        
        return {
            "value": response,
            "confidence": confidence,
            "source": "history"
        }
    
    def should_continue_reasoning(self, variable: str) -> Tuple[bool, str]:
        """
        Analyze if more reasoning is productive for this variable.
        
        Args:
            variable: The variable to analyze
            
        Returns:
            Tuple of (should_continue, reason)
        """
        # If we haven't reasoned about this variable much, continue
        last_confidence = self.reasoning_history.get_last_confidence(variable)
        
        if variable not in self.reasoning_history.history or len(self.reasoning_history.history[variable]) < 2:
            return True, "Initial reasoning"
        
        # If confidence is already high enough, no need for more reasoning
        if last_confidence >= self.confidence_threshold:
            return False, "Confidence threshold met"
        
        # Check if we've done too much reasoning on this variable
        if len(self.reasoning_history.history[variable]) >= self.max_reasoning_per_variable:
            return False, f"Maximum reasoning attempts ({self.max_reasoning_per_variable}) reached for {variable}"
        
        # Check for progress in confidence
        confidence_progress = self.reasoning_history.get_confidence_progress(variable)
        # If confidence is decreasing or not improving much, stop
        if confidence_progress <= self.progress_threshold:
            return False, f"Minimal confidence improvement: {confidence_progress:.2f}"
        
        # Check similarity with previous response (circular reasoning check)
        current_response = str(self.reasoning_history.get_last_response(variable))
        similarity = self.reasoning_history.get_similarity(variable, current_response)
        if similarity > self.similarity_threshold:  # High similarity threshold
            return False, f"Potential circular reasoning detected (similarity: {similarity:.2f})"
        
        return True, "Reasoning is still productive"
    
    def analyze_reasoning_process(self) -> Optional[Dict[str, Any]]:
        """Provides meta-analysis of the entire reasoning process"""
        # Only analyze after some time has passed to avoid too frequent analyses
        current_time = time.time()
        if current_time - self.last_analysis_time < 5:  # At least 5 seconds between analyses
            return None
        
        self.last_analysis_time = current_time
        
        if self.consecutive_calls >= 3:  # Analyze after 3+ consecutive calls
            total_variables = len(self.reasoning_history.history)
            variables_at_threshold = sum(1 for var in self.reasoning_history.history 
                                        if len(self.reasoning_history.history[var]) >= self.max_reasoning_per_variable)
            
            avg_confidence = self.reasoning_history.get_average_confidence()
            
            # If we're analyzing too much with little progress
            if variables_at_threshold > 0 or avg_confidence < 0.5:
                return {
                    "status": "inefficient",
                    "message": f"Reasoning appears inefficient. Analyzed {total_variables} variables with avg confidence {avg_confidence:.2f}.",
                    "recommendation": "Consider asking user for clarification rather than additional reasoning.",
                    "avg_confidence": avg_confidence
                }
            
            # If we're making reasonable progress
            if avg_confidence >= 0.6:
                return {
                    "status": "productive",
                    "message": f"Reasoning is productive with {total_variables} variables and avg confidence {avg_confidence:.2f}.",
                    "recommendation": "Continue current approach.",
                    "avg_confidence": avg_confidence
                }
        
        return None
    
    def check_and_handle(self, variable: Optional[str] = None) -> bool:
        """
        Check if we should continue reasoning and handle accordingly.
        Base implementation requests user input when limits are reached.
        
        Args:
            variable: Optional variable name to check
            
        Returns:
            True to proceed with reasoning, False to skip
        """
        # Track variable-specific reasoning if provided
        if variable is not None:
            should_continue, reason = self.should_continue_reasoning(variable)
            if not should_continue:
                logger.info(f"Stopping further reasoning on '{variable}': {reason}")
                return False
        
        # Check overall consecutive call limit
        if self.consecutive_calls >= self.max_consecutive_calls:
            analysis = self.analyze_reasoning_process()
            if analysis:
                logger.info(f"Meta-analysis: {analysis['message']}")
                logger.info(f"Recommendation: {analysis['recommendation']}")
            
            logger.warning(f"Rate limit reached: {self.consecutive_calls} consecutive AI reasoning steps.")
            logger.info(f"Total API calls so far: {self.total_calls}")
            # In this base version, we always continue but log the warning
            # User input would go here in a non-automated version
            return True
        
        # Perform occasional reasoning analysis
        elif self.consecutive_calls >= 3:
            analysis = self.analyze_reasoning_process()
            if analysis and analysis['status'] == 'inefficient':
                logger.info(f"Meta-analysis: {analysis['message']}")
                logger.info(f"Recommendation: {analysis['recommendation']}")
                # Could halt reasoning here, but we'll continue
                # Decide based on avg_confidence for automated decision
                if analysis.get('avg_confidence', 0.5) < 0.3:
                    logger.warning("Automatically stopping reasoning due to very low confidence")
                    return False
                
        return True
    
    def _extract_result(self, response: Any) -> Dict[str, Any]:
        """
        Extract structured result from AI response.
        
        Args:
            response: Raw AI response
            
        Returns:
            Structured result dictionary
        """
        try:
            # Simple extraction for demonstration - implement specific parsing logic
            text = getattr(response, 'text', str(response))
            lines = text.strip().split("\n")
            
            result = {"raw_text": text}
            
            # Try to extract Number/Confidence from format like:
            # Number: 123
            # Confidence: 0.8
            for line in lines:
                if line.startswith("Number:"):
                    try:
                        result["value"] = float(line.split(":", 1)[1].strip())
                    except:
                        pass
                elif line.startswith("Confidence:"):
                    try:
                        result["confidence"] = float(line.split(":", 1).strip())
                    except:
                        pass
            
            # Default values if not found
            if "value" not in result:
                result["value"] = None
                
            if "confidence" not in result:
                result["confidence"] = 0.5
                
            return result
            
        except Exception as e:
            logger.exception(f"Error extracting result: {e}")
            return {"value": None, "confidence": 0.5, "error": str(e)}


class AutomatedMetaReasoningAgent(MetaReasoningAgent):
    """
    A version of MetaReasoningAgent that never prompts for user input.
    Always continues processing with sensible defaults.
    """
    
    def check_and_handle(self, variable: Optional[str] = None) -> bool:
        """
        Automated version that never requests user input.
        Returns True to proceed with reasoning, False to skip based on automated rules.
        
        Args:
            variable: Optional variable name to check
            
        Returns:
            True to proceed with reasoning, False to skip
        """
        # Track variable-specific reasoning if provided
        if variable is not None:
            should_continue, reason = self.should_continue_reasoning(variable)
            if not should_continue:
                logger.info(f"Automatically stopping reasoning on '{variable}': {reason}")
                return False
        
        # Check overall consecutive call limit
        if self.consecutive_calls >= self.max_consecutive_calls:
            analysis = self.analyze_reasoning_process()
            if analysis:
                logger.info(f"Meta-analysis: {analysis['message']}")
                logger.info(f"Recommendation: {analysis['recommendation']}")
            
            logger.info(f"Rate limit reached: {self.consecutive_calls} consecutive AI reasoning steps.")
            logger.info(f"Total API calls so far: {self.total_calls}")
            logger.info("Automatically continuing reasoning (no user input required)")
            
            # Always reset consecutive counter and continue
            self.reset_consecutive()
        
        # Perform occasional reasoning analysis
        elif self.consecutive_calls >= 3:
            analysis = self.analyze_reasoning_process()
            if analysis and analysis['status'] == 'inefficient':
                logger.info(f"Meta-analysis: {analysis['message']}")
                logger.info(f"Recommendation: {analysis['recommendation']}")
                
                # Make automated decision based on confidence
                # If confidence is very low, we might want to stop
                should_continue = True
                if 'avg_confidence' in analysis and analysis.get('avg_confidence', 0.5) < 0.3:
                    logger.info("Automatically stopping further reasoning due to very low confidence")
                    should_continue = False
                else:
                    logger.info("Automatically continuing with reasoning")
                
                return should_continue
        
        return True 