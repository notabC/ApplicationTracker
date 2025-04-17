"""
Reflection reasoner implementation for self-evaluation of reasoning processes.
"""

from typing import Dict, Any, List, Optional
import json

from app.agents.reasoners.abstract_reasoner import AbstractReasoner

class ReflectionReasoner(AbstractReasoner):
    """
    Reasoner specialized in reflecting on and evaluating reasoning processes.
    
    The ReflectionReasoner analyzes past reasoning steps, identifies strengths and weaknesses
    in the thought process, and suggests improvements for future reasoning.
    """
    
    def __init__(self, model: Any):
        """Initialize the reflection reasoner."""
        super().__init__(model, name="Reflection")
    
    async def reason(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Reflect on the given reasoning process.
        
        Args:
            input_data: Dictionary containing:
                - reasoning_trace: The sequence of reasoning steps to reflect on
                - task_description: Description of the original task
                - ground_truth: The correct answer or solution (optional)
                - reflection_focus: Specific aspects to focus reflection on (optional)
                
        Returns:
            Dictionary containing the reflection with:
                - strengths: Identified strengths in the reasoning
                - weaknesses: Identified weaknesses in the reasoning
                - improvements: Suggested improvements for future reasoning
                - meta_cognitive_insights: Higher-order insights about the reasoning approach
        """
        result, success = await self.execute(input_data)
        return result
    
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the reflection prompt with the reasoning trace and focus areas.
        
        Args:
            input_data: Dictionary with reasoning trace and reflection focus
            
        Returns:
            Dictionary with the formatted prompt
        """
        reasoning_trace = input_data.get("reasoning_trace", "")
        task_description = input_data.get("task_description", "")
        ground_truth = input_data.get("ground_truth", "None provided")
        focus_areas = input_data.get("reflection_focus", [])
        
        # Format the focus areas as a bulleted list if provided
        focus_text = "\n".join([f"- {f}" for f in focus_areas]) if focus_areas else "No specific focus areas provided. Reflect comprehensively."
        
        prompt = f"""
        You are a metacognitive expert specializing in analyzing reasoning processes. Your task is to reflect on the following reasoning trace:
        
        # ORIGINAL TASK
        {task_description}
        
        # REASONING TRACE
        {reasoning_trace}
        
        # GROUND TRUTH (if available)
        {ground_truth}
        
        # REFLECTION FOCUS AREAS
        {focus_text}
        
        Carefully analyze the reasoning process demonstrated in the trace. Your reflection should:
        1. Identify strengths in the reasoning approach
        2. Identify weaknesses, gaps, or biases in the reasoning
        3. Suggest specific improvements to the reasoning process
        4. Provide metacognitive insights about the overall approach
        
        Format your response as a JSON object with the following structure:
        {{
            "strengths": [
                {{
                    "description": "Description of the reasoning strength",
                    "evidence": "Evidence from the reasoning trace",
                    "impact": "How this strength benefited the reasoning"
                }},
                ...
            ],
            "weaknesses": [
                {{
                    "description": "Description of the reasoning weakness",
                    "evidence": "Evidence from the reasoning trace",
                    "impact": "How this weakness hindered effective reasoning",
                    "type": "One of: [factual error, logical fallacy, cognitive bias, knowledge gap, process error]"
                }},
                ...
            ],
            "improvements": [
                {{
                    "description": "Suggested improvement to reasoning",
                    "rationale": "Why this would improve reasoning",
                    "application": "How to apply this improvement in future reasoning"
                }},
                ...
            ],
            "meta_cognitive_insights": [
                {{
                    "insight": "Higher-order insight about the reasoning approach",
                    "implication": "Implications for future reasoning tasks"
                }},
                ...
            ]
        }}
        """
        
        return {"prompt": prompt}
    
    def parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the raw model response into a structured reflection.
        
        Args:
            response: Raw response from the model
            
        Returns:
            Dictionary containing the parsed reflection
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
                    reflection_data = json.loads(json_str)
                else:
                    # If no JSON found, use the whole text as the reflection
                    reflection_data = {"error": "Could not parse JSON from response", "raw_response": text_content}
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw text
                reflection_data = {"error": "Invalid JSON in response", "raw_response": text_content}
            
            # Add reasoner metadata
            result = {
                "reasoner": self.name,
                "reflection": reflection_data
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error parsing reflection response: {str(e)}")
            return {
                "reasoner": self.name,
                "error": f"Failed to parse response: {str(e)}",
                "raw_response": response
            } 