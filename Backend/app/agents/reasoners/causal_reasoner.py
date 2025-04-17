"""
Causal reasoner implementation for analyzing cause-effect relationships and causal chains.
"""

from typing import Dict, Any, List, Optional
import json
import logging

from app.agents.reasoners.abstract_reasoner import AbstractReasoner

class CausalReasoner(AbstractReasoner):
    """
    Reasoner specialized in causal analysis and causal inference.
    
    The CausalReasoner identifies cause-effect relationships, distinguishes correlation from 
    causation, and maps out causal chains to enhance reasoning about complex systems.
    """
    
    def __init__(self, model: Any):
        """Initialize the causal reasoner."""
        super().__init__(model, name="Causal")
        self.logger = logging.getLogger(__name__)
    
    async def reason(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze causal relationships and chains for the given input.
        
        Args:
            input_data: Dictionary containing:
                - content: The reasoning or text to analyze for causal relationships
                - context: Optional additional context or background information
                - focus_variables: Optional list of specific variables to focus on
                - domain_knowledge: Optional domain-specific knowledge to consider
                
        Returns:
            Dictionary containing causal analysis with:
                - causal_chains: Identified causal chains
                - causal_factors: Key causal factors and their relationships
                - confounders: Potential confounding variables
                - interventions: Suggested interventions based on causal analysis
        """
        result, success = await self.execute(input_data)
        return result
    
    def format_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format the causal reasoning prompt.
        
        Args:
            input_data: Dictionary with content to analyze and context
            
        Returns:
            Dictionary with the formatted prompt
        """
        content = input_data.get("content", "")
        context = input_data.get("context", "No additional context provided.")
        focus_variables = input_data.get("focus_variables", [])
        domain_knowledge = input_data.get("domain_knowledge", "")
        
        # Format focus variables as a bulleted list if provided
        variables_text = ""
        if focus_variables:
            variables_text = "# FOCUS VARIABLES\n"
            variables_text += "\n".join([f"- {v}" for v in focus_variables])
        
        domain_text = ""
        if domain_knowledge:
            domain_text = f"# DOMAIN KNOWLEDGE\n{domain_knowledge}"
        
        prompt = f"""
        You are an expert in causal reasoning and causal inference. Your task is to analyze cause-effect relationships, causal chains, and distinguish correlation from causation in the following content:
        
        # CONTENT TO ANALYZE
        {content}
        
        # CONTEXT
        {context}
        
        {variables_text}
        
        {domain_text}
        
        Perform a thorough causal analysis by:
        1. Identifying direct cause-effect relationships in the content
        2. Mapping out causal chains, showing how effects become causes for other effects
        3. Distinguishing correlation from causation, highlighting potential confounding variables
        4. Identifying mediating and moderating variables in causal relationships
        5. Evaluating the strength of evidence for each causal claim
        6. Suggesting causal hypotheses that could explain the observed phenomena
        7. Proposing potential interventions based on your causal analysis
        
        Format your response as a JSON object with the following structure:
        {{
            "causal_factors": [
                {{
                    "factor": "Description of a causal factor",
                    "type": "cause/effect/both",
                    "evidence_strength": "Strong/Moderate/Weak",
                    "evidence_basis": "Explanation of the evidence supporting this as a causal factor"
                }},
                ...
            ],
            "causal_chains": [
                {{
                    "id": "C1",
                    "description": "Brief description of this causal chain",
                    "chain": ["Factor A → Factor B → Factor C → Outcome D"],
                    "confidence": "Assessment of confidence in this causal chain (1-10)",
                    "key_mechanisms": "Explanation of the mechanisms behind this causal chain"
                }},
                ...
            ],
            "potential_confounders": [
                {{
                    "confounder": "Description of potential confounding variable",
                    "affects": ["Variables affected by this confounder"],
                    "explanation": "How this confounder might create spurious correlations"
                }},
                ...
            ],
            "correlation_vs_causation": [
                {{
                    "correlation": "Description of a correlation in the content",
                    "causal_assessment": "Assessment of whether this is likely causal or not",
                    "reasoning": "Reasoning behind this assessment"
                }},
                ...
            ],
            "interventions": [
                {{
                    "intervention": "Description of a potential intervention",
                    "target_factor": "Factor targeted by this intervention",
                    "expected_effect": "Expected effect of this intervention",
                    "confidence": "Confidence in the effectiveness (1-10)",
                    "potential_side_effects": ["Potential side effects or unintended consequences"]
                }},
                ...
            ],
            "key_insights": [
                "Key causal insight from the analysis",
                ...
            ]
        }}
        
        Ensure your analysis is rigorous, distinguishing between established causal relationships, plausible hypotheses, and mere correlations.
        """
        
        return {"prompt": prompt}
    
    def parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse the raw model response into a structured causal analysis.
        
        Args:
            response: Raw response from the model
            
        Returns:
            Dictionary containing the parsed causal analysis
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
                    causal_data = json.loads(json_str)
                else:
                    # If no JSON found, use the whole text as the evaluation
                    causal_data = {"error": "Could not parse JSON from response", "raw_response": text_content}
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw text
                causal_data = {"error": "Invalid JSON in response", "raw_response": text_content}
            
            # Add reasoner metadata
            result = {
                "reasoner": self.name,
                "causal_analysis": causal_data
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error parsing causal response: {str(e)}")
            return {
                "reasoner": self.name,
                "error": f"Failed to parse response: {str(e)}",
                "raw_response": response
            } 