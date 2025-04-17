"""
ReAct reasoner implementation.

This module implements the ReAct (Reasoning and Acting) approach for LLM reasoning.
ReAct interleaves reasoning traces and task-specific actions in a synergistic way,
allowing models to generate both thoughts and actions, and observe the results
of those actions.
"""

import logging
import re
import json
from typing import Dict, List, Any, Optional, Union, Callable, Awaitable

from app.agents.reasoners.abstract_reasoner import AbstractReasoner
from app.agents.prompts.react_prompts import (
    REACT_SYSTEM_PROMPT, 
    REACT_PROMPT_TEMPLATE,
    format_tool_descriptions,
    format_reasoning_history
)


class ReActReasoner(AbstractReasoner):
    """
    Implementation of the ReAct reasoning approach.
    
    The ReAct approach follows a Thought-Action-Observation cycle where:
    1. The model thinks about the current state and what to do next
    2. The model decides on an action to take
    3. The action is executed and the model observes the result
    4. The cycle repeats until a stopping condition is met
    """
    
    def __init__(
        self,
        model,
        name: str = "ReAct Reasoner",
        tools: List[Dict[str, Any]] = None,
        max_iterations: int = 10,
        stop_at_answer: bool = True
    ):
        """
        Initialize the ReAct reasoner.
        
        Args:
            model: The language model to use for reasoning
            name: Name of the reasoner
            tools: List of tool specifications available to the reasoner
            max_iterations: Maximum number of reasoning iterations
            stop_at_answer: Whether to stop when an answer is found
        """
        self.model = model
        self.name = name
        self.tools = tools or []
        self.max_iterations = max_iterations
        self.stop_at_answer = stop_at_answer
        self.logger = logging.getLogger(__name__)
        self.on_step = None  # Callback function for step-by-step updates

    async def reason(
        self,
        input_data: Dict[str, Any],
        tool_executor: Any
    ) -> Dict[str, Any]:
        """
        Execute the ReAct reasoning process.
        
        Args:
            input_data: Dictionary containing query and optional context
            tool_executor: Tool executor instance for executing tool actions
            
        Returns:
            Dictionary containing the reasoning results, including:
            - query: The original query
            - reasoning_trace: The full trace of thoughts, actions, and observations
            - actions: List of actions taken
            - observations: List of observations received
            - iterations: Number of iterations performed
            - stopping_reason: Reason for stopping
            - answer: Final answer if one was found
        """
        query = input_data.get("query", "")
        context = input_data.get("context", "")
        
        # Initialize tracking variables
        thoughts = []
        actions = []
        observations = []
        iterations = 0
        stopping_reason = "max_iterations_reached"
        answer = None
        
        # Prepare the system prompt with tool descriptions
        system_prompt = REACT_SYSTEM_PROMPT.format(
            tool_descriptions=format_tool_descriptions(self.tools)
        )
        
        self.logger.info(f"Starting ReAct reasoning for query: {query}")

        # Main reasoning loop
        while iterations < self.max_iterations:
            iterations += 1
            
            # Format the current reasoning history
            reasoning_history = format_reasoning_history(thoughts, actions, observations)
            
            # Format the user prompt
            user_prompt = REACT_PROMPT_TEMPLATE.format(
                query=query,
                context=context,
                reasoning_history=reasoning_history
            )
            
            # Get the model's response
            self.logger.info(f"Iteration {iterations}: Generating next step")
            
            response = await self.model.generate(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Parse the response
            parsed_response = self.parse_response(response_text)
            
            thought = parsed_response.get("thought", "")
            action_name = parsed_response.get("action", "")
            action_input = parsed_response.get("action_input", "")
            
            # Check if we have an answer
            if "answer" in parsed_response:
                answer = parsed_response["answer"]
                stopping_reason = "answer_found"
                self.logger.info(f"Answer found: {answer}")
                
                # Record the final thought
                thoughts.append(thought)
                actions.append({"name": "answer", "input": answer})
                observations.append("Answer provided.")
                
                # Send step update if callback is registered
                if self.on_step:
                    step_data = {
                        "iteration": iterations,
                        "thought": thought,
                        "action": {"name": "answer", "input": answer},
                        "observation": "Answer provided.",
                        "is_final": True
                    }
                    await self.on_step(step_data)
                
                if self.stop_at_answer:
                    break
            
            # If no answer or action, continue to next iteration
            if not action_name and not answer:
                self.logger.warning(f"No action or answer in response: {response_text}")
                thoughts.append(thought if thought else "I'm not sure what to do next.")
                actions.append({"name": "none", "input": "No action taken"})
                observations.append("No action was taken. Please specify a valid action or provide an answer.")
                
                # Send step update if callback is registered
                if self.on_step:
                    step_data = {
                        "iteration": iterations,
                        "thought": thought if thought else "I'm not sure what to do next.",
                        "action": {"name": "none", "input": "No action taken"},
                        "observation": "No action was taken. Please specify a valid action or provide an answer.",
                        "is_final": False
                    }
                    await self.on_step(step_data)
                
                continue
            
            # If we have an action, execute it
            if action_name:
                thoughts.append(thought)
                
                # Prepare the action record
                action = {"name": action_name, "input": action_input}
                actions.append(action)
                
                # Execute the action
                try:
                    self.logger.info(f"Executing action: {action_name} with input: {action_input}")
                    result = await tool_executor.execute(action_name, action_input)
                    
                    # Format the observation
                    if "error" in result:
                        observation = f"Error: {result['error']}"
                    else:
                        observation = str(result["result"])
                    
                    observations.append(observation)
                    
                    # Send step update if callback is registered
                    if self.on_step:
                        step_data = {
                            "iteration": iterations,
                            "thought": thought,
                            "action": action,
                            "observation": observation,
                            "is_final": False
                        }
                        await self.on_step(step_data)
                    
                except Exception as e:
                    error_message = f"Error executing action {action_name}: {str(e)}"
                    self.logger.error(error_message, exc_info=True)
                    observations.append(error_message)
                    
                    # Send step update if callback is registered
                    if self.on_step:
                        step_data = {
                            "iteration": iterations,
                            "thought": thought,
                            "action": action,
                            "observation": error_message,
                            "is_final": False,
                            "error": str(e)
                        }
                        await self.on_step(step_data)

        self.logger.info(f"Reasoning completed after {iterations} iterations. Stopping reason: {stopping_reason}")
        
        # Prepare the result
        result = {
            "query": query,
            "reasoning_trace": {
                "thoughts": thoughts,
                "actions": actions,
                "observations": observations
            },
            "actions": actions,
            "observations": observations,
            "iterations": iterations,
            "stopping_reason": stopping_reason,
            "answer": answer
        }
        
        return result
    
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the input data into a prompt for the model.
        
        Args:
            input_data: The data to format into a prompt
        
        Returns:
            A dictionary containing the formatted prompt and any additional parameters
        """
        query = input_data.get("query", "")
        context = input_data.get("context", "")
        reasoning_history = input_data.get("reasoning_history", "")
        
        # Format tool descriptions
        tool_descriptions = format_tool_descriptions(self.tools)
        
        # Create system prompt
        system_prompt = REACT_SYSTEM_PROMPT.format(
            tool_descriptions=tool_descriptions
        )
        
        # Create user prompt
        user_prompt = REACT_PROMPT_TEMPLATE.format(
            query=query,
            context=context,
            reasoning_history=reasoning_history or "No reasoning steps taken yet."
        )
        
        return {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        }
        
    def parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse the model's response text into components.
        
        Args:
            response_text: The raw text response from the model
            
        Returns:
            Dictionary containing parsed components (thought, action, action_input, answer)
        """
        parsed = {
            "thought": "",
            "action": "",
            "action_input": "",
            "answer": None
        }
        
        # First try using regex to extract the components
        result = self.parse_response_text_format(response_text)
        
        if result:
            parsed.update(result)
        else:
            # If regex parsing fails, just use the entire response as the thought
            self.logger.warning(f"Failed to parse response: {response_text}")
            parsed["thought"] = response_text
            
        return parsed
        
    def parse_response_text_format(self, text: str) -> Dict[str, Any]:
        """
        Parse response text that follows the ReAct format.
        
        The expected format is:
        
        Thought: <reasoning>
        Action: <action_name>
        Action Input: <action_input_json>
        
        Or for final answers:
        
        Thought: <reasoning>
        Answer: <answer>
        
        Args:
            text: The response text to parse
            
        Returns:
            Dictionary with parsed components or None if parsing fails
        """
        result = {}
        
        # Extract thought
        thought_match = re.search(r"Thought:(.*?)(?:Action:|Answer:|$)", text, re.DOTALL)
        if thought_match:
            result["thought"] = thought_match.group(1).strip()
        
        # Extract action
        action_match = re.search(r"Action:(.*?)(?:Action Input:|$)", text, re.DOTALL)
        if action_match:
            result["action"] = action_match.group(1).strip()
        
        # Extract action input
        action_input_match = re.search(r"Action Input:(.*?)(?:$)", text, re.DOTALL)
        if action_input_match:
            action_input_text = action_input_match.group(1).strip()
            
            # Try to parse as JSON
            try:
                # Check if it's already a dict (happens when the model outputs properly formatted JSON)
                if isinstance(action_input_text, dict):
                    result["action_input"] = action_input_text
                else:
                    # Try to parse as JSON
                    result["action_input"] = json.loads(action_input_text)
            except json.JSONDecodeError:
                # If not valid JSON, use as is
                result["action_input"] = action_input_text
        
        # Extract answer
        answer_match = re.search(r"Answer:(.*?)(?:$)", text, re.DOTALL)
        if answer_match:
            result["answer"] = answer_match.group(1).strip()
        
        return result 