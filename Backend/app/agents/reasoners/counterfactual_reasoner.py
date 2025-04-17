"""
Counterfactual reasoner implementation for exploring alternative reasoning paths and scenarios.
"""

from typing import Dict, Any, List, Optional
import json
import logging

from app.agents.reasoners.abstract_reasoner import AbstractReasoner

class CounterfactualReasoner(AbstractReasoner):
    """
    Reasoner specialized in generating counterfactual scenarios and alternative reasoning paths.
    
    The CounterfactualReasoner explores "what if" scenarios, challenges assumptions, and
    identifies alternative explanations to strengthen reasoning and decision-making.
    """
    
    def __init__(self, model: Any):
        """Initialize the counterfactual reasoner."""
        super().__init__(model, name="Counterfactual")
        self.logger = logging.getLogger(__name__)
    
    async def reason(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate counterfactual scenarios and alternative reasoning paths for the given input.
        
        Args:
            input_data: Dictionary containing:
                - reasoning: The original reasoning or conclusion to challenge
                - context: Optional additional context or background information
                - assumptions: Optional list of explicit assumptions to challenge
                - key_variables: Optional variables to alter in counterfactuals
                - num_alternatives: Optional number of alternatives to generate (default: 3)
                
        Returns:
            Dictionary containing counterfactual analysis with:
                - alternative_paths: List of alternative reasoning paths
                - challenged_assumptions: Analysis of challenged assumptions
                - key_insights: Insights gained from counterfactual analysis
                - most_promising_alternative: The most promising alternative path
        """
        result, success = await self.execute(input_data)
        return result
    
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the counterfactual reasoning prompt.
        
        Args:
            input_data: Dictionary with reasoning to challenge and context
            
        Returns:
            Dictionary with the formatted prompt
        """
        reasoning = input_data.get("reasoning", "")
        context = input_data.get("context", "No additional context provided.")
        assumptions = input_data.get("assumptions", [])
        key_variables = input_data.get("key_variables", [])
        num_alternatives = input_data.get("num_alternatives", 3)
        
        # Format assumptions as a bulleted list if provided
        assumptions_text = ""
        if assumptions:
            assumptions_text = "# EXPLICIT ASSUMPTIONS TO CHALLENGE\n"
            assumptions_text += "\n".join([f"- {a}" for a in assumptions])
        
        # Format key variables as a bulleted list if provided
        variables_text = ""
        if key_variables:
            variables_text = "# KEY VARIABLES TO ALTER\n"
            variables_text += "\n".join([f"- {v}" for v in key_variables])
        
        prompt = f"""
        You are an expert in counterfactual reasoning and alternative analysis. Your task is to generate alternative reasoning paths by challenging assumptions, altering variables, and exploring "what if" scenarios for the following reasoning:
        
        # ORIGINAL REASONING
        {reasoning}
        
        # CONTEXT
        {context}
        
        {assumptions_text}
        
        {variables_text}
        
        Generate {num_alternatives} alternative reasoning paths by:
        1. Identifying and challenging implicit assumptions in the original reasoning
        2. Exploring alternative explanations for the same evidence
        3. Considering what would happen if key variables or conditions were different
        4. Applying different frameworks or perspectives to the problem
        5. Identifying edge cases or exceptions that might invalidate the original reasoning
        
        For each alternative path:
        - Clearly articulate which assumptions are being challenged or variables altered
        - Develop a coherent alternative reasoning path based on these changes
        - Evaluate the plausibility and implications of this alternative
        - Compare it to the original reasoning
        
        Conclude by discussing which alternative path is most promising and what key insights emerge from this counterfactual analysis.
        
        Format your response as a JSON object with the following structure:
        {{
            "implicit_assumptions": [
                {{
                    "assumption": "Description of an implicit assumption in the original reasoning",
                    "critique": "Why this assumption might be questionable"
                }},
                ...
            ],
            "alternative_paths": [
                {{
                    "id": "A1",
                    "name": "Brief descriptive name for this alternative",
                    "challenged_assumptions": ["Which assumptions (implicit or explicit) are being challenged"],
                    "altered_variables": ["Which variables are being altered, if any"],
                    "reasoning": "Detailed alternative reasoning path",
                    "plausibility": "Assessment of how plausible this alternative is (1-10)",
                    "key_differences": "How this path differs from the original reasoning",
                    "implications": "Key implications if this alternative is correct"
                }},
                ...
            ],
            "most_promising_alternative": {{
                "id": "ID of the most promising alternative",
                "justification": "Why this alternative is most promising"
            }},
            "key_insights": [
                "Key insight from the counterfactual analysis",
                ...
            ],
            "recommendation": "Overall recommendation based on the counterfactual analysis"
        }}
        """
        
        return {"prompt": prompt}
    
    def parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the raw model response into a structured counterfactual analysis.
        
        Args:
            response: Raw response from the model
            
        Returns:
            Dictionary containing the parsed counterfactual analysis
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
                    counterfactual_data = json.loads(json_str)
                else:
                    # If no JSON found, use the whole text as the evaluation
                    counterfactual_data = {"error": "Could not parse JSON from response", "raw_response": text_content}
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw text
                counterfactual_data = {"error": "Invalid JSON in response", "raw_response": text_content}
            
            # Add reasoner metadata
            result = {
                "reasoner": self.name,
                "counterfactual_analysis": counterfactual_data
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error parsing counterfactual response: {str(e)}")
            return {
                "reasoner": self.name,
                "error": f"Failed to parse response: {str(e)}",
                "raw_response": response
            } 