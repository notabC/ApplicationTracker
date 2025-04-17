"""
Tool executor for agent systems.

This module provides functionality for executing tools within agent systems.
Tools are functions or actions that agents can use to interact with external
systems, APIs, or perform operations.
"""

import inspect
import logging
from typing import Any, Dict, List, Callable, Optional, Union, Awaitable


class ToolExecutor:
    """
    Executes tools on behalf of agent reasoners.
    
    A tool executor maintains a registry of available tools and handles
    their execution when requested by a reasoner, providing a consistent
    interface for tool invocation.
    """
    
    def __init__(self):
        """Initialize the tool executor with an empty tool registry."""
        self.tools = {}
        self.logger = logging.getLogger(__name__)
    
    def register_tool(self, name: str, func: Callable, description: str = "", 
                     parameter_descriptions: Optional[Dict[str, str]] = None) -> None:
        """
        Register a tool with the executor.
        
        Args:
            name: Unique name for the tool
            func: The callable function implementing the tool
            description: Human-readable description of what the tool does
            parameter_descriptions: Optional descriptions of the tool's parameters
        """
        if name in self.tools:
            self.logger.warning(f"Tool '{name}' already registered, overwriting")
        
        # Get parameter information from function signature
        signature = inspect.signature(func)
        parameters = []
        
        for param_name, param in signature.parameters.items():
            # Skip self parameter for methods
            if param_name == 'self':
                continue
                
            param_info = {
                "name": param_name,
                "required": param.default == inspect.Parameter.empty,
                "type": str(param.annotation) if param.annotation != inspect.Parameter.empty else "any"
            }
            
            # Add description if provided
            if parameter_descriptions and param_name in parameter_descriptions:
                param_info["description"] = parameter_descriptions[param_name]
            else:
                param_info["description"] = f"Parameter '{param_name}' for tool '{name}'"
            
            parameters.append(param_info)
        
        self.tools[name] = {
            "func": func,
            "description": description,
            "parameters": parameters
        }
        
        self.logger.info(f"Registered tool '{name}' with {len(parameters)} parameters")
    
    def get_tool_specs(self) -> List[Dict[str, Any]]:
        """
        Get specifications of all registered tools.
        
        Returns:
            List of tool specifications containing name, description, and parameters
        """
        specs = []
        for name, tool in self.tools.items():
            specs.append({
                "name": name,
                "description": tool["description"],
                "parameters": tool["parameters"]
            })
        return specs
    
    async def execute(self, tool_name: str, tool_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool with the given input.
        
        Args:
            tool_name: Name of the tool to execute
            tool_input: Dictionary of parameters to pass to the tool
        
        Returns:
            Dictionary containing the result of the tool execution
            
        Raises:
            ValueError: If the tool is not registered or required parameters are missing
        """
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not registered")
        
        tool = self.tools[tool_name]
        func = tool["func"]
        
        # Check for required parameters
        for param in tool["parameters"]:
            if param["required"] and param["name"] not in tool_input:
                raise ValueError(f"Required parameter '{param['name']}' missing for tool '{tool_name}'")
        
        try:
            self.logger.info(f"Executing tool '{tool_name}' with parameters: {list(tool_input.keys())}")
            
            # Call the function with the provided parameters
            result = func(**tool_input)
            
            # Handle async functions
            if inspect.isawaitable(result):
                result = await result
                
            return {"result": result}
        except Exception as e:
            self.logger.error(f"Error executing tool '{tool_name}': {str(e)}", exc_info=True)
            return {"error": str(e)}
    
    def __call__(self, tool_name: str, tool_input: Dict[str, Any]) -> Union[Dict[str, Any], Awaitable[Dict[str, Any]]]:
        """
        Allow the executor to be called directly like a function.
        
        Args:
            tool_name: Name of the tool to execute
            tool_input: Dictionary of parameters to pass to the tool
        
        Returns:
            Result of the tool execution or awaitable for async execution
        """
        return self.execute(tool_name, tool_input) 