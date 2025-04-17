"""
Planning reasoner implementation for creating plans to solve complex tasks.
"""

from typing import Dict, Any, List, Optional
import json

from app.agents.reasoners.abstract_reasoner import AbstractReasoner

class PlanningReasoner(AbstractReasoner):
    """
    Reasoner specialized in creating structured plans for complex tasks.
    
    The PlanningReasoner generates a sequence of steps needed to solve a given problem,
    producing a structured plan with subtasks, reasoning, and considerations.
    """
    
    def __init__(self, model: Any):
        """Initialize the planning reasoner."""
        super().__init__(model, name="Planning")
    
    async def reason(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a plan based on the input data.
        
        Args:
            input_data: Dictionary containing:
                - problem: The problem description
                - context: Additional context information
                - constraints: Any constraints to consider
                
        Returns:
            Dictionary containing the generated plan with:
                - steps: List of plan steps
                - reasoning: Explanation of the planning process
                - considerations: Important factors considered
        """
        result, success = await self.execute(input_data)
        return result
    
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the planning prompt with the problem description and context.
        
        Args:
            input_data: Dictionary with planning task details
            
        Returns:
            Dictionary with the formatted prompt
        """
        problem = input_data.get("problem", "")
        context = input_data.get("context", "")
        constraints = input_data.get("constraints", [])
        
        constraints_text = "\n".join([f"- {c}" for c in constraints]) if constraints else "None specified."
        
        prompt = f"""
        You are a strategic planning expert. Your task is to create a detailed plan for solving the following problem:
        
        # PROBLEM
        {problem}
        
        # CONTEXT
        {context}
        
        # CONSTRAINTS
        {constraints_text}
        
        Generate a detailed, step-by-step plan to solve this problem. Your plan should:
        1. Break down the problem into clear, sequential steps
        2. Identify potential challenges and how to address them
        3. Consider the constraints specified above
        4. Provide reasoning for key decisions
        
        Format your response as a JSON object with the following structure:
        {{
            "plan_name": "Brief descriptive name for this plan",
            "steps": [
                {{
                    "step_number": 1,
                    "name": "Name of step",
                    "description": "Detailed description",
                    "expected_outcome": "What should result from this step"
                }},
                ...
            ],
            "reasoning": "Your overall reasoning for this plan structure",
            "considerations": ["Important factor 1", "Important factor 2", ...]
        }}
        """
        
        return {"prompt": prompt}
    
    def parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the raw model response into a structured plan.
        
        Args:
            response: Raw response from the model
            
        Returns:
            Dictionary containing the parsed plan
        """
        try:
            # Extract the text content from the response
            if "choices" in response and len(response["choices"]) > 0:
                text_content = response["choices"][0]["message"]["content"]
            else:
                text_content = response.get("content", "")
            
            # Extract JSON from the response
            # Look for JSON structure in the text
            try:
                # Try to find JSON object in the text if it's embedded
                json_start = text_content.find("{")
                json_end = text_content.rfind("}")
                
                if json_start != -1 and json_end != -1:
                    json_str = text_content[json_start:json_end+1]
                    plan_data = json.loads(json_str)
                else:
                    # If no JSON found, use the whole text as the plan
                    plan_data = {"error": "Could not parse JSON from response", "raw_response": text_content}
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw text
                plan_data = {"error": "Invalid JSON in response", "raw_response": text_content}
            
            # Add reasoner metadata
            result = {
                "reasoner": self.name,
                "plan": plan_data
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error parsing planning response: {str(e)}")
            return {
                "reasoner": self.name,
                "error": f"Failed to parse response: {str(e)}",
                "raw_response": response
            } 