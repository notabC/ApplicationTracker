"""
Critic reasoner implementation for evaluating plans and solutions.
"""

from typing import Dict, Any, List, Optional
import json

from app.agents.reasoners.abstract_reasoner import AbstractReasoner

class CriticReasoner(AbstractReasoner):
    """
    Reasoner specialized in critically evaluating plans, solutions, or other outputs.
    
    The CriticReasoner analyzes proposals for flaws, inconsistencies, and areas of improvement,
    providing structured feedback and suggestions for enhancement.
    """
    
    def __init__(self, model: Any):
        """Initialize the critic reasoner."""
        super().__init__(model, name="Critic")
    
    async def reason(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Critique the input plan or solution.
        
        Args:
            input_data: Dictionary containing:
                - plan: The plan or solution to critique
                - context: Additional context information
                - evaluation_criteria: Specific criteria to evaluate against (optional)
                
        Returns:
            Dictionary containing the critique with:
                - strengths: Identified strengths
                - weaknesses: Identified weaknesses
                - suggestions: Suggested improvements
                - overall_assessment: Summary evaluation
        """
        result, success = await self.execute(input_data)
        return result
    
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the critique prompt with the plan and evaluation criteria.
        
        Args:
            input_data: Dictionary with plan and evaluation criteria
            
        Returns:
            Dictionary with the formatted prompt
        """
        plan = input_data.get("plan", "")
        context = input_data.get("context", "")
        criteria = input_data.get("evaluation_criteria", [])
        
        # Format the criteria as a bulleted list if provided
        criteria_text = "\n".join([f"- {c}" for c in criteria]) if criteria else "No specific criteria provided. Evaluate comprehensively."
        
        # Format the plan as a string if it's a dictionary
        plan_text = json.dumps(plan, indent=2) if isinstance(plan, dict) else str(plan)
        
        prompt = f"""
        You are an expert critic with exceptional analytical skills. Your task is to critically evaluate the following plan or solution:
        
        # PLAN/SOLUTION TO EVALUATE
        {plan_text}
        
        # CONTEXT
        {context}
        
        # EVALUATION CRITERIA
        {criteria_text}
        
        Provide a thorough critique of the plan/solution. Your evaluation should:
        1. Identify strengths and positive aspects
        2. Pinpoint weaknesses, gaps, inconsistencies, or potential issues
        3. Suggest specific improvements or alternatives
        4. Provide an overall assessment
        
        Format your response as a JSON object with the following structure:
        {{
            "strengths": [
                {{
                    "description": "Description of the strength",
                    "impact": "Why this is important/beneficial"
                }},
                ...
            ],
            "weaknesses": [
                {{
                    "description": "Description of the weakness",
                    "impact": "Potential negative consequences",
                    "severity": "High/Medium/Low"
                }},
                ...
            ],
            "suggestions": [
                {{
                    "description": "Suggested improvement",
                    "rationale": "Why this would help",
                    "implementation_notes": "How to implement this suggestion"
                }},
                ...
            ],
            "overall_assessment": {{
                "rating": 1-10,
                "summary": "Brief summary assessment",
                "key_insights": ["Key insight 1", "Key insight 2", ...]
            }}
        }}
        """
        
        return {"prompt": prompt}
    
    def parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the raw model response into a structured critique.
        
        Args:
            response: Raw response from the model
            
        Returns:
            Dictionary containing the parsed critique
        """
        try:
            # Extract the text content from the response
            if "choices" in response and len(response["choices"]) > 0:
                text_content = response["choices"][0]["message"]["content"]
            else:
                text_content = response.get("content", "")
            
            # Extract JSON from the response
            try:
                # Try to find JSON object in the text if it's embedded
                json_start = text_content.find("{")
                json_end = text_content.rfind("}")
                
                if json_start != -1 and json_end != -1:
                    json_str = text_content[json_start:json_end+1]
                    critique_data = json.loads(json_str)
                else:
                    # If no JSON found, use the whole text as the critique
                    critique_data = {"error": "Could not parse JSON from response", "raw_response": text_content}
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw text
                critique_data = {"error": "Invalid JSON in response", "raw_response": text_content}
            
            # Add reasoner metadata
            result = {
                "reasoner": self.name,
                "critique": critique_data
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error parsing critic response: {str(e)}")
            return {
                "reasoner": self.name,
                "error": f"Failed to parse response: {str(e)}",
                "raw_response": response
            } 