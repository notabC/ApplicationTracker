"""
Chain-of-Thought Reasoner implementation for the Meta-Reasoning framework.

This module implements a reasoner that encourages the model to work through problems
step-by-step, showing its reasoning process explicitly before arriving at an answer.
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional, Union

from app.agents.reasoners.abstract_reasoner import AbstractReasoner

class CoTReasoner(AbstractReasoner):
    """
    Chain-of-Thought (CoT) reasoner that encourages step-by-step reasoning.
    
    CoT prompts the model to break down complex problems into intermediate steps,
    making the reasoning process explicit. This can lead to more accurate results
    for problems that benefit from multi-step reasoning.
    """
    
    def __init__(
        self, 
        model: Any, 
        name: str = "ChainOfThought",
        zero_shot: bool = True,
        examples: Optional[List[Dict[str, str]]] = None
    ):
        """
        Initialize the Chain-of-Thought reasoner.
        
        Args:
            model: The language model to use
            name: The name of this reasoner instance
            zero_shot: Whether to use zero-shot prompting (if False, few-shot examples must be provided)
            examples: List of few-shot examples if zero_shot is False. Each example should have 
                      'input' and 'reasoning' keys.
        """
        super().__init__(model, name)
        self.zero_shot = zero_shot
        self.examples = examples if examples else []
        
        if not zero_shot and not examples:
            self.logger.warning("Few-shot CoT requested but no examples provided. Falling back to zero-shot.")
            self.zero_shot = True
    
    async def reason(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply Chain-of-Thought reasoning to the input data.
        
        Args:
            input_data: The input data containing at minimum a 'query' or 'problem' key
            
        Returns:
            Dictionary containing the reasoning steps and final answer
        """
        self.logger.info(f"Starting {self.name} reasoning process")
        
        # Format the prompt based on whether we're doing zero-shot or few-shot
        prompt_data = self.format_prompt(input_data)
        
        # Call the model with the formatted prompt
        response = await self.call_model(prompt_data)
        
        # Parse the response to extract reasoning and answer
        result = self.parse_response(response)
        
        # Add the original query to the result
        result["query"] = input_data.get("query", input_data.get("problem", ""))
        
        self.logger.info(f"Completed {self.name} reasoning process")
        return result
    
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the input data into a Chain-of-Thought prompt.
        
        Args:
            input_data: The input data to format, containing at minimum a 'query' or 'problem' key
            
        Returns:
            Dictionary containing the formatted prompt
        """
        if self.zero_shot:
            prompt = self._format_zero_shot_prompt(input_data)
        else:
            prompt = self._format_few_shot_prompt(input_data)
        
        return {"prompt": prompt}
    
    def _format_zero_shot_prompt(self, input_data: Dict[str, Any]) -> str:
        """
        Format a zero-shot Chain-of-Thought prompt.
        
        Args:
            input_data: The input data to format
            
        Returns:
            Formatted prompt string
        """
        # Extract the query from input data
        query = input_data.get("query", input_data.get("problem", ""))
        if not query:
            raise ValueError("Input data must contain a 'query' or 'problem' field")
        
        # Get any additional context if provided
        context = input_data.get("context", "")
        context_str = f"\nContext:\n{context}\n" if context else ""
        
        # Format the zero-shot prompt
        prompt = f"""Please solve the following problem step-by-step, showing your complete reasoning process.
{context_str}
Problem: {query}

Let's think about this step-by-step:
1. """
        
        return prompt
    
    def _format_few_shot_prompt(self, input_data: Dict[str, Any]) -> str:
        """
        Format a few-shot Chain-of-Thought prompt with examples.
        
        Args:
            input_data: The input data to format
            
        Returns:
            Formatted prompt string
        """
        # Extract the query from input data
        query = input_data.get("query", input_data.get("problem", ""))
        if not query:
            raise ValueError("Input data must contain a 'query' or 'problem' field")
        
        # Get any additional context if provided
        context = input_data.get("context", "")
        context_str = f"\nContext:\n{context}\n" if context else ""
        
        # Build the few-shot prompt with examples
        prompt = "Please solve problems by showing your step-by-step reasoning, like in these examples:\n\n"
        
        # Add the examples
        for i, example in enumerate(self.examples, 1):
            prompt += f"Example {i}:\n"
            prompt += f"Problem: {example['input']}\n\n"
            prompt += f"Solution:\n{example['reasoning']}\n\n"
        
        # Add the actual problem to solve
        prompt += f"Now, please solve this problem:{context_str}\n"
        prompt += f"Problem: {query}\n\n"
        prompt += "Solution:\n"
        
        return prompt
    
    def parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the Chain-of-Thought response from the model.
        
        Args:
            response: The response from the language model
            
        Returns:
            Dictionary containing parsed reasoning steps and final answer
        """
        content = response.get("content", "")
        if not content:
            raise ValueError("Empty response from model")
        
        if self.zero_shot:
            return self._parse_zero_shot_response(content)
        else:
            return self._parse_few_shot_response(content)
    
    def _parse_zero_shot_response(self, content: str) -> Dict[str, Any]:
        """
        Parse a zero-shot Chain-of-Thought response.
        
        Args:
            content: The raw content from the model response
            
        Returns:
            Dictionary with reasoning steps and final answer
        """
        # Extract reasoning steps and final answer
        lines = content.strip().split('\n')
        
        # Try to find the final answer, often prefaced with "Therefore," "Thus," "So," etc.
        answer_indicators = ["therefore", "thus", "so", "in conclusion", "the answer is", "final answer"]
        
        reasoning_steps = []
        final_answer = ""
        
        # Check if there's a JSON block in the response
        json_content = self._extract_json_from_response(content)
        if json_content:
            return json_content
        
        # Otherwise parse the text response
        for i, line in enumerate(lines):
            # Look for answer indicators near the end of the response
            if i > len(lines) // 2:  # Only check in the latter half of the response
                for indicator in answer_indicators:
                    if indicator in line.lower():
                        final_answer = line
                        break
            
            # If we're still collecting reasoning steps
            if not final_answer:
                reasoning_steps.append(line)
        
        # If we didn't find an explicit final answer, use the last line
        if not final_answer and lines:
            final_answer = lines[-1]
        
        # Remove the final answer from reasoning steps if it's there
        if final_answer in reasoning_steps:
            reasoning_steps.remove(final_answer)
        
        return {
            "reasoning": "\n".join(reasoning_steps),
            "answer": final_answer.strip(),
            "raw_response": content
        }
    
    def _parse_few_shot_response(self, content: str) -> Dict[str, Any]:
        """
        Parse a few-shot Chain-of-Thought response.
        
        Args:
            content: The raw content from the model response
            
        Returns:
            Dictionary with reasoning steps and final answer
        """
        # Check if there's a JSON block in the response
        json_content = self._extract_json_from_response(content)
        if json_content:
            return json_content
        
        # Split the content into lines
        lines = content.strip().split('\n')
        
        # In few-shot responses, we expect the model to format its answer like our examples
        # Look for sections that might indicate a final answer or conclusion
        reasoning_lines = []
        answer_lines = []
        
        in_answer_section = False
        answer_indicators = ["therefore", "thus", "so", "in conclusion", "the answer is", "final answer"]
        
        for line in lines:
            lower_line = line.lower()
            
            # Check if we've hit an answer section
            if any(indicator in lower_line for indicator in answer_indicators) or in_answer_section:
                in_answer_section = True
                answer_lines.append(line)
            else:
                reasoning_lines.append(line)
        
        # If we didn't find an answer section, use the last line as the answer
        if not answer_lines and reasoning_lines:
            answer_lines = [reasoning_lines.pop()]
        
        return {
            "reasoning": "\n".join(reasoning_lines),
            "answer": "\n".join(answer_lines).strip(),
            "raw_response": content
        }
    
    def _extract_json_from_response(self, content: str) -> Optional[Dict[str, Any]]:
        """
        Try to extract a JSON object from the response if present.
        
        Args:
            content: The raw content from the model response
            
        Returns:
            Dictionary parsed from JSON if found, None otherwise
        """
        # Look for JSON-like content between curly braces
        json_match = re.search(r'({[\s\S]*})', content)
        if json_match:
            try:
                json_str = json_match.group(1)
                json_data = json.loads(json_str)
                return json_data
            except json.JSONDecodeError:
                self.logger.debug("Found JSON-like content but couldn't parse it")
        
        return None 