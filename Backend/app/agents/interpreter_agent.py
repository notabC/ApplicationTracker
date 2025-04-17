"""
Interpreter agent module - handles the extraction and structuring of information from AI responses.
"""

import logging
import re
import json
from typing import Dict, List, Any, Optional, Tuple, Union
import ast
from .base_agent import BaseAgent, AIModelInterface
from .reasoning_agent import MetaReasoningAgent

# Configure logging
logger = logging.getLogger(__name__)

class ExtractedValue:
    """
    Container for an extracted value with associated metadata.
    """
    def __init__(self, 
                value: Any, 
                confidence: float = 0.0, 
                reasoning: Optional[str] = None,
                original_text: Optional[str] = None):
        self.value = value
        self.confidence = confidence
        self.reasoning = reasoning
        self.original_text = original_text
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            "value": self.value,
            "confidence": self.confidence,
            "reasoning": self.reasoning,
            "original_text": self.original_text
        }
        
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ExtractedValue':
        """Create from dictionary"""
        return cls(
            value=data.get("value"),
            confidence=data.get("confidence", 0.0),
            reasoning=data.get("reasoning"),
            original_text=data.get("original_text")
        )


class InterpreterAgent(BaseAgent):
    """
    Agent for extracting structured data from unstructured text.
    """
    def __init__(self, ai_model: AIModelInterface):
        super().__init__(ai_model)
        
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data to extract structured information.
        
        Args:
            input_data: Input data including text and extraction parameters
            
        Returns:
            Processed output with extracted values
        """
        text = input_data.get("text", "")
        variable = input_data.get("variable")
        expected_type = input_data.get("expected_type", "string")
        
        if not text:
            return {"error": "No text provided for interpretation"}
            
        try:
            # Extract the value using basic extraction
            extracted = self._extract_value(text, variable, expected_type)
            
            return {
                "status": "success",
                "extracted": extracted.to_dict(),
                "variable": variable
            }
        except Exception as e:
            logger.exception(f"Error in InterpreterAgent.process: {e}")
            return {"status": "error", "error": str(e), "variable": variable}
    
    def _extract_value(self, text: str, variable: str, expected_type: str) -> ExtractedValue:
        """
        Extract a value from text based on the expected type.
        
        Args:
            text: Text to extract from
            variable: Name of the variable being extracted
            expected_type: Expected data type (string, integer, float, boolean, list, object)
            
        Returns:
            ExtractedValue object with the extracted value and metadata
        """
        # Look for specific patterns like:
        # Variable: value
        # Variable = value
        # The Variable is value
        patterns = [
            rf"{variable}\s*[:=]\s*(.*?)(?:\n|$)",
            rf"(?:the|for)\s+{variable}\s+(?:is|as)\s+(.*?)(?:\n|$)",
            rf"{variable}.*?[:=]\s*(.*?)(?:\n|$)"
        ]
        
        extracted_text = None
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted_text = match.group(1).strip()
                break
                
        if not extracted_text:
            # Fall back to using the full text
            extracted_text = text.strip()
            
        # Extract confidence if present
        confidence = 0.5  # Default confidence
        confidence_pattern = r"confidence:?\s*(\d+\.?\d*)"
        confidence_match = re.search(confidence_pattern, text, re.IGNORECASE)
        if confidence_match:
            try:
                confidence = float(confidence_match.group(1))
                # Normalize to 0-1 range if it's given as percentage
                if confidence > 1:
                    confidence /= 100
            except ValueError:
                pass
                
        # Extract reasoning if present
        reasoning = None
        reasoning_pattern = r"reasoning:?\s*(.*?)(?:\n\n|\n[A-Z]|\Z)"
        reasoning_match = re.search(reasoning_pattern, text, re.IGNORECASE | re.DOTALL)
        if reasoning_match:
            reasoning = reasoning_match.group(1).strip()
            
        # Convert value to the expected type
        value = self._convert_to_type(extracted_text, expected_type)
        
        return ExtractedValue(
            value=value,
            confidence=confidence,
            reasoning=reasoning,
            original_text=text
        )
    
    def _convert_to_type(self, value_str: str, expected_type: str) -> Any:
        """
        Convert a string value to the expected type.
        
        Args:
            value_str: String representation of the value
            expected_type: Expected data type
            
        Returns:
            Converted value
        """
        if not value_str:
            return None
            
        try:
            if expected_type.lower() in ["string", "str", "text"]:
                return value_str
                
            elif expected_type.lower() in ["integer", "int", "number"]:
                # Clean the string and try to convert to int
                clean_value = re.sub(r'[^\d.-]', '', value_str)
                return int(float(clean_value))
                
            elif expected_type.lower() in ["float", "decimal", "double"]:
                # Clean the string and convert to float
                clean_value = re.sub(r'[^\d.-]', '', value_str)
                return float(clean_value)
                
            elif expected_type.lower() in ["boolean", "bool"]:
                return value_str.lower() in ["true", "yes", "y", "1", "t"]
                
            elif expected_type.lower() in ["list", "array"]:
                # Try to parse as JSON first
                try:
                    # Remove any markdown code block syntax
                    clean_value = re.sub(r'```.*?\n', '', value_str)
                    clean_value = re.sub(r'```', '', clean_value)
                    return json.loads(clean_value)
                except json.JSONDecodeError:
                    # Try to use ast.literal_eval for Python list syntax
                    try:
                        return ast.literal_eval(clean_value)
                    except (SyntaxError, ValueError):
                        # Fall back to splitting by commas
                        return [item.strip() for item in clean_value.split(',')]
                        
            elif expected_type.lower() in ["object", "dict", "map", "json"]:
                # Try to parse as JSON
                try:
                    # Remove any markdown code block syntax
                    clean_value = re.sub(r'```.*?\n', '', value_str)
                    clean_value = re.sub(r'```', '', clean_value)
                    return json.loads(clean_value)
                except json.JSONDecodeError:
                    # Try to use ast.literal_eval for Python dict syntax
                    try:
                        return ast.literal_eval(clean_value)
                    except (SyntaxError, ValueError):
                        # Return as string if we can't parse it
                        return value_str
            else:
                # Unknown type, return as string
                return value_str
                
        except Exception as e:
            logger.warning(f"Error converting '{value_str}' to {expected_type}: {e}")
            return value_str  # Return as string if conversion fails


class SmartInterpreterAgent(MetaReasoningAgent):
    """
    Advanced interpreter agent that uses meta-reasoning to improve extraction quality.
    """
    def __init__(self, 
                 ai_model: AIModelInterface,
                 max_consecutive_calls: int = 3,
                 max_reasoning_per_variable: int = 2):
        """
        Initialize the smart interpreter agent.
        
        Args:
            ai_model: The AI model interface implementation
            max_consecutive_calls: Maximum number of consecutive calls
            max_reasoning_per_variable: Maximum reasoning attempts per variable
        """
        super().__init__(
            ai_model=ai_model,
            max_consecutive_calls=max_consecutive_calls,
            max_reasoning_per_variable=max_reasoning_per_variable,
            similarity_threshold=0.9,
            confidence_threshold=0.8,
            progress_threshold=0.05
        )
        self.interpreter = InterpreterAgent(ai_model)
        
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data with meta-reasoning to extract structured information.
        
        Args:
            input_data: Input data including text and extraction parameters
            
        Returns:
            Processed output with extracted values and meta-reasoning details
        """
        text = input_data.get("text", "")
        variable = input_data.get("variable")
        schema = input_data.get("schema", {})
        expected_type = schema.get("type", "string")
        
        if not text:
            return {"error": "No text provided for interpretation"}
            
        # First try basic extraction
        basic_result = await self.interpreter.process(input_data)
        
        if basic_result.get("status") == "success" and basic_result.get("extracted", {}).get("confidence", 0) >= 0.8:
            # If basic extraction is confident, use it directly
            return {
                "status": "success",
                "extracted": basic_result["extracted"],
                "variable": variable,
                "meta": {
                    "method": "basic_extraction",
                    "reasoning_steps": 0
                }
            }
            
        # Need more advanced extraction with LLM reasoning
        if not self.check_and_handle(variable):
            # Meta-reasoning decided not to proceed
            return {
                "status": "skipped",
                "reason": "Meta-reasoning determined further processing is not productive",
                "variable": variable,
                "extracted": basic_result.get("extracted", {"value": None, "confidence": 0.0}),
                "meta": {
                    "method": "meta_reasoning_skip",
                    "reasoning_steps": self.reasoning_history.get_total_steps()
                }
            }
            
        # Prepare a prompt for more advanced extraction
        prompt = self._create_extraction_prompt(text, variable, schema)
        
        try:
            response = await self.ai_model.agenerate_content(prompt)
            self.increment()
            
            # Process the response
            extraction_result = await self.interpreter.process({
                "text": getattr(response, "text", str(response)),
                "variable": variable,
                "expected_type": expected_type
            })
            
            extracted = extraction_result.get("extracted", {})
            value = extracted.get("value")
            confidence = extracted.get("confidence", 0.5)
            
            # Track reasoning
            self.track_reasoning(variable, value, confidence)
            
            return {
                "status": "success",
                "extracted": extracted,
                "variable": variable,
                "meta": {
                    "method": "llm_reasoning",
                    "reasoning_steps": self.reasoning_history.get_total_steps(),
                    "consecutive_calls": self.consecutive_calls,
                    "total_calls": self.total_calls
                }
            }
            
        except Exception as e:
            logger.exception(f"Error in SmartInterpreterAgent.process: {e}")
            return {
                "status": "error", 
                "error": str(e), 
                "variable": variable,
                "extracted": basic_result.get("extracted", {"value": None, "confidence": 0.0})
            }
    
    def _create_extraction_prompt(self, text: str, variable: str, schema: Dict[str, Any]) -> str:
        """
        Create a prompt for advanced extraction with reasoning.
        
        Args:
            text: Text to extract from
            variable: Name of the variable being extracted
            schema: JSON Schema describing the expected structure
            
        Returns:
            Extraction prompt
        """
        expected_type = schema.get("type", "string")
        description = schema.get("description", f"Extract the {variable}")
        
        examples = ""
        if "examples" in schema:
            examples = "\nExamples of valid values:\n"
            for example in schema["examples"]:
                examples += f"- {json.dumps(example)}\n"
                
        constraints = ""
        if "enum" in schema:
            constraints += f"\nThe value must be one of: {', '.join(str(v) for v in schema['enum'])}"
            
        if expected_type == "number" or expected_type == "integer":
            if "minimum" in schema:
                constraints += f"\nMinimum value: {schema['minimum']}"
            if "maximum" in schema:
                constraints += f"\nMaximum value: {schema['maximum']}"
                
        if expected_type == "string" and "pattern" in schema:
            constraints += f"\nMust match pattern: {schema['pattern']}"
            
        format_hint = ""
        if expected_type == "string" and "format" in schema:
            format_hint = f"\nFormat: {schema['format']}"
            
        previous_reasoning = ""
        if variable in self.reasoning_history.history and self.reasoning_history.history[variable]:
            prev = self.reasoning_history.history[variable][-1]
            previous_reasoning = f"\nPrevious extraction attempt:\nValue: {prev['response']}\nConfidence: {prev['confidence']}\n"
            
        prompt = f"""
Extract the value for '{variable}' from the following text. 

Expected type: {expected_type}
{description}
{examples}
{constraints}
{format_hint}
{previous_reasoning}

Text to extract from:
'''{text}'''

Please analyze the text carefully and extract the value for '{variable}'. Provide:
1. The extracted value in the appropriate format
2. Your confidence in the extraction (0.0-1.0)
3. Your reasoning process

Format your response as:
Value: <extracted value>
Confidence: <confidence 0.0-1.0>
Reasoning: <explain your extraction reasoning>
"""
        return prompt 