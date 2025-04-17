"""
EPR (Explanation, Prediction, Refinement) Reasoner for systematic critical thinking.

This reasoner implements the three-step EPR process:
1. Explanation: Generate hypotheses to explain observations
2. Prediction: Make predictions based on hypotheses
3. Refinement: Evaluate and refine hypotheses based on new evidence
"""

import json
import logging
from typing import Dict, Any, List, Optional

from app.agents.reasoners.abstract_reasoner import AbstractReasoner

class EPRReasoner(AbstractReasoner):
    """
    EPR (Explanation, Prediction, Refinement) Reasoner for systematic critical thinking.
    
    The EPR process enables structured reasoning through three core steps:
    - Explanation: Formulating hypotheses that could explain observed data or phenomena
    - Prediction: Making testable predictions based on these hypotheses
    - Refinement: Evaluating hypotheses against new evidence and refining accordingly
    
    This approach helps prevent confirmation bias and promotes scientific thinking
    by encouraging multiple competing hypotheses and systematic evaluation.
    """
    
    def __init__(self, model: Any, name: str = "EPR"):
        """
        Initialize the EPR reasoner with the language model.
        
        Args:
            model: The language model to use for reasoning
            name: The name of the reasoner (defaults to "EPR")
        """
        super().__init__(model, name)
        self.logger = logging.getLogger(__name__)
    
    async def reason(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply the EPR reasoning process to the input data.
        
        Args:
            input_data: Dictionary containing:
                - "observation": The phenomenon or data to explain
                - "context": Additional context or domain knowledge
                - "prior_hypotheses": Optional list of existing hypotheses
                - "evidence": Optional new evidence for refinement
                
        Returns:
            Dictionary containing:
                - "hypotheses": List of formulated explanatory hypotheses
                - "predictions": List of predictions derived from each hypothesis
                - "evaluation": Evaluation of hypotheses against evidence
                - "refined_hypotheses": Refined hypotheses after evaluation
        """
        self.logger.info(f"Starting EPR reasoning process for: {input_data.get('observation', 'Unspecified observation')}")
        result, success = await self.execute(input_data)
        if success:
            self.logger.info(f"EPR reasoning completed successfully with {len(result.get('hypotheses', []))} hypotheses")
        else:
            self.logger.error(f"EPR reasoning failed: {result.get('error', 'Unknown error')}")
        return result
    
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the input data into a structured EPR reasoning prompt.
        
        Args:
            input_data: Dictionary containing the observation, context, etc.
            
        Returns:
            Dictionary containing the formatted prompt for the model
        """
        observation = input_data.get("observation", "")
        context = input_data.get("context", "")
        prior_hypotheses = input_data.get("prior_hypotheses", [])
        evidence = input_data.get("evidence", [])
        
        prompt = f"""
You are an expert critical thinker implementing the EPR (Explanation, Prediction, Refinement) reasoning process.

# Input Information
- Observation: {observation}
- Context: {context}
"""

        if prior_hypotheses:
            prompt += "\n# Prior Hypotheses\n"
            for i, h in enumerate(prior_hypotheses, 1):
                prompt += f"{i}. {h}\n"
        
        if evidence:
            prompt += "\n# New Evidence\n"
            for i, e in enumerate(evidence, 1):
                prompt += f"{i}. {e}\n"
        
        prompt += """
# Task
Please apply the EPR reasoning process:

## 1. Explanation
Develop 3-5 possible hypotheses that could explain the observation. Aim for diversity of explanations that each account for the known facts.

## 2. Prediction
For each hypothesis, derive 2-3 specific, testable predictions that would follow if the hypothesis were true.

## 3. Refinement
Evaluate each hypothesis against available evidence. Identify which hypotheses are strengthened or weakened, and refine them accordingly.

# Output Format
Provide your reasoning in a JSON structure:
```json
{
  "hypotheses": [
    {"id": 1, "statement": "Hypothesis statement", "reasoning": "Reasoning behind this hypothesis"},
    ...
  ],
  "predictions": [
    {"hypothesis_id": 1, "predictions": [
      {"id": "1a", "statement": "Prediction statement", "testability": "How this prediction could be tested"},
      ...
    ]},
    ...
  ],
  "evaluation": [
    {"hypothesis_id": 1, "strengths": ["Strength 1", ...], "weaknesses": ["Weakness 1", ...], "confidence": 0.7},
    ...
  ],
  "refined_hypotheses": [
    {"id": 1, "original_id": 1, "statement": "Refined hypothesis", "changes": "Explanation of refinements made"},
    ...
  ]
}
```
"""
        
        return {"prompt": prompt}
    
    def parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the model's response into a structured EPR result.
        
        Args:
            response: Raw response from the model
            
        Returns:
            Dictionary containing the parsed EPR reasoning results
        """
        try:
            content = response.get("content", "")
            
            # Extract JSON from the response
            json_str = self._extract_json(content)
            if not json_str:
                self.logger.warning("Could not extract JSON from response")
                return {
                    "error": "Failed to extract structured output from model response",
                    "raw_response": content,
                    "hypotheses": [],
                    "predictions": [],
                    "evaluation": [],
                    "refined_hypotheses": []
                }
            
            # Parse the JSON
            result = json.loads(json_str)
            
            # Validate the structure
            self._validate_epr_structure(result)
            
            # Add metadata
            result["reasoner"] = self.name
            result["reasoning_process"] = "EPR"
            
            return result
            
        except json.JSONDecodeError as e:
            self.logger.error(f"JSON parse error: {str(e)}")
            return {
                "error": f"Failed to parse JSON from model response: {str(e)}",
                "raw_response": response.get("content", ""),
                "hypotheses": [],
                "predictions": [],
                "evaluation": [],
                "refined_hypotheses": []
            }
        except Exception as e:
            self.logger.error(f"Unexpected error parsing response: {str(e)}")
            return {
                "error": f"Unexpected error parsing response: {str(e)}",
                "raw_response": response.get("content", ""),
                "hypotheses": [],
                "predictions": [],
                "evaluation": [],
                "refined_hypotheses": []
            }
    
    def _extract_json(self, content: str) -> str:
        """
        Extract JSON string from model response.
        
        Args:
            content: The model's response content
            
        Returns:
            Extracted JSON string or empty string if not found
        """
        # Look for JSON pattern (including code blocks)
        if "```json" in content and "```" in content.split("```json", 1)[1]:
            return content.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in content and "```" in content.split("```", 1)[1]:
            json_content = content.split("```", 1)[1].split("```", 1)[0].strip()
            try:
                # Test if it's valid JSON
                json.loads(json_content)
                return json_content
            except:
                pass
        
        # Look for JSON-like content between curly braces
        if "{" in content and "}" in content:
            start = content.find("{")
            # Find the matching closing brace
            level = 0
            for i in range(start, len(content)):
                if content[i] == "{":
                    level += 1
                elif content[i] == "}":
                    level -= 1
                    if level == 0:
                        end = i + 1
                        break
            else:
                return ""
            
            json_content = content[start:end].strip()
            try:
                # Test if it's valid JSON
                json.loads(json_content)
                return json_content
            except:
                return ""
        
        return ""
    
    def _validate_epr_structure(self, data: Dict[str, Any]) -> None:
        """
        Validate and normalize the structure of an EPR result.
        
        Args:
            data: The parsed JSON data to validate
            
        Raises:
            ValueError: If the data is missing required components
        """
        # Ensure all required components exist
        if "hypotheses" not in data:
            data["hypotheses"] = []
        
        if "predictions" not in data:
            data["predictions"] = []
        
        if "evaluation" not in data:
            data["evaluation"] = []
        
        if "refined_hypotheses" not in data:
            data["refined_hypotheses"] = []
        
        # Ensure all hypotheses have the required fields
        for h in data["hypotheses"]:
            if "id" not in h:
                h["id"] = 0
            if "statement" not in h:
                h["statement"] = "Unspecified hypothesis"
            if "reasoning" not in h:
                h["reasoning"] = "No reasoning provided" 