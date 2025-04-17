"""
Abstract reasoner interface.

This module defines the interface that all reasoner implementations must follow.
"""

import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List, Optional, Union, Callable

class AbstractReasoner(ABC):
    """
    Abstract base class for all reasoner implementations.
    
    A reasoner is responsible for processing input data (typically a query and context)
    and producing a response, possibly using tools to gather additional information
    or perform actions during the reasoning process.
    """
    
    def __init__(
        self, 
        model: Any,
        name: str,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ):
        """
        Initialize the reasoner.
        
        Args:
            model: The language model to use for reasoning
            name: A unique identifier for this reasoner
            tools: A list of tool specifications available to the reasoner
            **kwargs: Additional parameters specific to the reasoning implementation
        """
        self.model = model
        self.name = name
        self.tools = tools or []
        self.logger = logging.getLogger(__name__)
    
    @abstractmethod
    async def reason(self, input_data: Dict[str, Any], tool_executor: Any) -> Dict[str, Any]:
        """
        Execute the reasoning process on the given input data.
        
        Args:
            input_data: A dictionary containing at least:
                - query: The question or task to reason about
                - context: Optional additional context
                - Other fields depending on the reasoner implementation
            tool_executor: An executor for running tools during reasoning
            
        Returns:
            A dictionary containing the reasoning results, including at minimum:
            - query: The original query
            - answer: The final answer or result (if found)
            
            Implementations may include additional fields with more detailed
            information about the reasoning process.
        """
        pass
    
    async def call_model(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call the language model with formatted input data.
        
        Args:
            input_data: Processed input data ready for the model
        
        Returns:
            The model's response
        """
        formatted_input = self.format_prompt(input_data)
        return await self.model.invoke(**formatted_input)
    
    @abstractmethod
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the input data into a prompt for the model.
        
        Args:
            input_data: The data to format into a prompt
        
        Returns:
            A dictionary containing the formatted prompt and any additional parameters
        """
        pass
    
    @abstractmethod
    def parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the model's response into a structured format.
        
        Args:
            response: The raw response from the model
        
        Returns:
            A structured representation of the model's response
        """
        pass
    
    async def execute(self, input_data: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
        """
        Execute the reasoning process by formatting the prompt, 
        calling the language model, and parsing the response.
        
        Args:
            input_data: The input data to reason about
            
        Returns:
            Tuple containing:
                - The result of the reasoning process
                - A boolean indicating whether the reasoning was successful
        """
        try:
            # Format the prompt
            prompt_data = self.format_prompt(input_data)
            
            # Call the language model
            response = await self.call_model(prompt_data)
            
            # Parse the response
            result = self.parse_response(response)
            
            # Add metadata
            result["reasoner"] = self.name
            
            return result, True
            
        except Exception as e:
            self.logger.error(f"Error in {self.name} reasoning: {str(e)}")
            return {
                "error": f"Reasoning error: {str(e)}",
                "reasoner": self.name
            }, False 