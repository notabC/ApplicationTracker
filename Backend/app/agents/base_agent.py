"""
Base agent classes and interfaces for the agent system.
"""

import logging
import time
from typing import Dict, Any, Optional, List, Protocol, runtime_checkable
from abc import ABC, abstractmethod

# Configure logging
logger = logging.getLogger(__name__)

@runtime_checkable
class AIModelInterface(Protocol):
    """Protocol defining the interface for AI model interactions."""
    
    async def agenerate_content(self, prompt: str, **kwargs) -> Any:
        """
        Generate content using the AI model.
        
        Args:
            prompt: The prompt to generate content from
            **kwargs: Additional model parameters
            
        Returns:
            Model response object with a .text attribute or that can be converted to string
        """
        ...

class BaseAgent(ABC):
    """
    Base class for all agents in the system.
    
    Provides common functionality and defines the interface that all agents
    should implement.
    """
    
    def __init__(self, ai_model: AIModelInterface):
        """
        Initialize the base agent.
        
        Args:
            ai_model: Implementation of AIModelInterface for model interactions
        """
        self.ai_model = ai_model
        self.total_calls = 0
        
    def increment(self):
        """Increment the total call counter."""
        self.total_calls += 1
        
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data and return a response.
        
        Args:
            input_data: Input data dictionary
            
        Returns:
            Output data dictionary
        """
        pass
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the agent's operation.
        
        Returns:
            Dictionary with usage statistics
        """
        return {
            "total_calls": self.total_calls
        }
    
class StatTrackingAgent(BaseAgent):
    """
    Agent implementation that tracks detailed stats about its operation.
    """
    
    def __init__(self, ai_model: AIModelInterface):
        """Initialize with detailed stat tracking."""
        super().__init__(ai_model)
        self.successful_calls = 0
        self.failed_calls = 0
        self.total_tokens_in = 0
        self.total_tokens_out = 0
        self.call_history: List[Dict[str, Any]] = []
        
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data with stat tracking.
        
        Args:
            input_data: Input data dictionary
            
        Returns:
            Output data dictionary
        """
        # Implementation should be provided by subclasses
        pass
        
    def track_call(self, input_data: Dict[str, Any], 
                   output_data: Dict[str, Any], 
                   success: bool,
                   tokens_in: Optional[int] = None,
                   tokens_out: Optional[int] = None) -> None:
        """
        Track a model call with detailed statistics.
        
        Args:
            input_data: The input provided to the model
            output_data: The output returned by the model
            success: Whether the call was successful
            tokens_in: Number of input tokens if available
            tokens_out: Number of output tokens if available
        """
        self.increment()
        
        if success:
            self.successful_calls += 1
        else:
            self.failed_calls += 1
            
        if tokens_in:
            self.total_tokens_in += tokens_in
        if tokens_out:
            self.total_tokens_out += tokens_out
            
        # Record the call details
        self.call_history.append({
            "timestamp": time.time(),
            "input": input_data,
            "output": output_data,
            "success": success,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out
        })
        
    def get_stats(self) -> Dict[str, Any]:
        """
        Get detailed statistics about the agent's operation.
        
        Returns:
            Dictionary with usage statistics
        """
        stats = super().get_stats()
        stats.update({
            "successful_calls": self.successful_calls,
            "failed_calls": self.failed_calls,
            "success_rate": self.successful_calls / max(self.total_calls, 1),
            "total_tokens_in": self.total_tokens_in,
            "total_tokens_out": self.total_tokens_out,
            "total_tokens": self.total_tokens_in + self.total_tokens_out,
            "call_history_length": len(self.call_history)
        })
        return stats 