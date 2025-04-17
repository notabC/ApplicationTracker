"""
Consistency reasoner implementation for detecting logical inconsistencies and contradictions.
"""

from typing import Dict, Any, List, Optional
import json
import logging

from app.agents.reasoners.abstract_reasoner import AbstractReasoner

class ConsistencyReasoner(AbstractReasoner):
    """
    Reasoner specialized in detecting logical inconsistencies and contradictions.
    
    The ConsistencyReasoner analyzes reasoning chains, statements, and plans to identify
    internal contradictions, logical inconsistencies, and coherence issues.
    """
    
    def __init__(self, model: Any):
        """Initialize the consistency reasoner."""
        super().__init__(model, name="Consistency")
        self.logger = logging.getLogger(__name__)
    
    async def reason(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate the logical consistency of the given input.
        
        Args:
            input_data: Dictionary containing:
                - content: The reasoning, statements, or plan to evaluate
                - context: Optional additional context or background information
                - domain_constraints: Optional domain-specific constraints or rules
                
        Returns:
            Dictionary containing the consistency evaluation with:
                - is_consistent: Boolean indicating overall consistency
                - contradictions: List of identified contradictions
                - unclear_statements: List of vague or ambiguous statements
                - coherence_score: Numerical score of overall coherence (0-10)
                - recommendations: Suggestions to resolve inconsistencies
        """
        result, success = await self.execute(input_data)
        return result
    
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the consistency evaluation prompt.
        
        Args:
            input_data: Dictionary with content to evaluate and context
            
        Returns:
            Dictionary with the formatted prompt
        """
        content = input_data.get("content", "")
        context = input_data.get("context", "No additional context provided.")
        domain_constraints = input_data.get("domain_constraints", [])
        
        # Format domain constraints as a bulleted list if provided
        constraints_text = ""
        if domain_constraints:
            constraints_text = "# DOMAIN CONSTRAINTS AND RULES\n"
            constraints_text += "\n".join([f"- {c}" for c in domain_constraints])
        
        prompt = f"""
        You are a logical consistency expert with exceptional attention to detail. Your task is to analyze the following content for internal contradictions, logical inconsistencies, and coherence issues:
        
        # CONTENT TO EVALUATE
        {content}
        
        # CONTEXT
        {context}
        
        {constraints_text}
        
        Carefully analyze the content for:
        1. Direct contradictions: Statements that directly oppose each other
        2. Implicit contradictions: Statements that indirectly lead to contradictory conclusions
        3. Unclear or ambiguous statements that could lead to multiple interpretations
        4. Violations of domain constraints or rules (if provided)
        5. Overall logical coherence and flow
        
        Format your response as a JSON object with the following structure:
        {{
            "is_consistent": boolean,
            "overall_assessment": "Brief overall assessment of consistency",
            "contradictions": [
                {{
                    "statements": ["First contradictory statement", "Second contradictory statement"],
                    "explanation": "Explanation of why these statements contradict",
                    "severity": "One of: [critical, major, minor]"
                }},
                ...
            ],
            "unclear_statements": [
                {{
                    "statement": "The unclear or ambiguous statement",
                    "issue": "Description of why this statement is problematic",
                    "possible_interpretations": ["Interpretation 1", "Interpretation 2", ...]
                }},
                ...
            ],
            "constraint_violations": [
                {{
                    "constraint": "The violated constraint",
                    "violation": "How the content violates this constraint",
                    "location": "Where in the content this violation occurs"
                }},
                ...
            ],
            "coherence_score": number (0-10),
            "coherence_issues": [
                {{
                    "issue": "Description of coherence issue",
                    "impact": "How this affects overall coherence"
                }},
                ...
            ],
            "recommendations": [
                {{
                    "issue": "The issue to address",
                    "recommendation": "Specific recommendation to resolve the issue"
                }},
                ...
            ]
        }}
        
        If no issues are found in any category, include an empty array for that category.
        """
        
        return {"prompt": prompt}
    
    def parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the raw model response into a structured consistency evaluation.
        
        Args:
            response: Raw response from the model
            
        Returns:
            Dictionary containing the parsed consistency evaluation
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
                    consistency_data = json.loads(json_str)
                else:
                    # If no JSON found, use the whole text as the evaluation
                    consistency_data = {"error": "Could not parse JSON from response", "raw_response": text_content}
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw text
                consistency_data = {"error": "Invalid JSON in response", "raw_response": text_content}
            
            # Add reasoner metadata
            result = {
                "reasoner": self.name,
                "consistency_evaluation": consistency_data
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error parsing consistency response: {str(e)}")
            return {
                "reasoner": self.name,
                "error": f"Failed to parse response: {str(e)}",
                "raw_response": response
            } 