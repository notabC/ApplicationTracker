"""
Tests for the ReAct Reasoner implementation.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json

from app.agents.reasoners.react_reasoner import ReActReasoner


class MockModel:
    """Mock model class for testing."""
    
    async def invoke(self, prompt, **kwargs):
        """Mock model invoker that returns a simple response."""
        if "Final Answer Request" in prompt:
            return {"content": "Answer: This is the final answer."}
        
        return {"content": """Thought: This is a test thought.

Action: search(query="test")

"""}


class TestReActReasoner:
    """Test cases for the ReAct reasoner."""
    
    @pytest.fixture
    def mock_model(self):
        """Create a mock model."""
        return MockModel()
    
    @pytest.fixture
    def reasoner(self, mock_model):
        """Create a ReAct reasoner with a mock model."""
        tools = [
            {
                "name": "search",
                "description": "Search for information",
                "parameters": [
                    {
                        "name": "query",
                        "description": "Search query",
                        "required": True
                    }
                ]
            }
        ]
        
        async def mock_tool_executor(name, params):
            return f"Result for {name} with params {params}"
        
        return ReActReasoner(
            model=mock_model,
            name="TestReAct",
            tools=tools,
            max_iterations=3,
            tool_executor=mock_tool_executor
        )
    
    @pytest.mark.asyncio
    async def test_init(self, mock_model):
        """Test reasoner initialization."""
        reasoner = ReActReasoner(model=mock_model, name="TestInit")
        
        assert reasoner.name == "TestInit"
        assert reasoner.model == mock_model
        assert reasoner.tools == []
        assert reasoner.max_iterations == 5
        assert reasoner.tool_executor is None
    
    @pytest.mark.asyncio
    async def test_format_prompt(self, reasoner):
        """Test prompt formatting."""
        input_data = {
            "query": "What is the capital of France?",
            "context": "The user is asking about geography.",
            "iteration": 2,
            "reasoning_history": ["I need to find out the capital of France."],
            "actions_history": [{"name": "search", "params": {"query": "capital of France"}}],
            "observations_history": ["Paris is the capital of France."]
        }
        
        result = reasoner.format_prompt(input_data)
        
        assert isinstance(result, dict)
        assert "prompt" in result
        
        prompt = result["prompt"]
        assert "Problem" in prompt
        assert "What is the capital of France?" in prompt
        assert "Context" in prompt
        assert "The user is asking about geography." in prompt
        assert "Available Tools" in prompt
        assert "search: Search for information" in prompt
        assert "Parameters" in prompt
        assert "query: Search query (required)" in prompt
        assert "History" in prompt
        assert "Thought 1: I need to find out the capital of France." in prompt
        assert "Action 1: search(query=capital of France)" in prompt
        assert "Observation 1: Paris is the capital of France." in prompt
        assert "Current Iteration (Step 2)" in prompt
    
    @pytest.mark.asyncio
    async def test_format_final_answer_prompt(self, reasoner):
        """Test final answer prompt formatting."""
        input_data = {
            "query": "What is the capital of France?",
            "context": "The user is asking about geography.",
            "reasoning_history": ["I need to find out the capital of France."],
            "actions_history": [{"name": "search", "params": {"query": "capital of France"}}],
            "observations_history": ["Paris is the capital of France."]
        }
        
        result = reasoner.format_final_answer_prompt(input_data)
        
        assert isinstance(result, str)
        assert "Original Problem" in result
        assert "What is the capital of France?" in result
        assert "Context" in result
        assert "The user is asking about geography." in result
        assert "Reasoning History" in result
        assert "Thought 1: I need to find out the capital of France." in result
        assert "Action 1: search(query=capital of France)" in result
        assert "Observation 1: Paris is the capital of France." in result
        assert "Final Answer Request" in result
    
    @pytest.mark.asyncio
    async def test_parse_response_text_format(self, reasoner):
        """Test parsing response in text format."""
        response = {
            "content": """Thought: This is a test thought.

Action: search(query="test query", limit=10)

Answer: This is the final answer."""
        }
        
        result = reasoner.parse_response(response)
        
        assert result["thought"] == "This is a test thought."
        assert result["action"]["name"] == "search"
        assert result["action"]["params"]["query"] == "test query"
        assert result["action"]["params"]["limit"] == 10
        assert result["answer"] == "This is the final answer."
    
    @pytest.mark.asyncio
    async def test_parse_response_json_format(self, reasoner):
        """Test parsing response in JSON format."""
        response = {
            "content": """
Here's my response:

```json
{
    "thought": "This is a test thought in JSON.",
    "action": {
        "name": "search",
        "params": {
            "query": "json test"
        }
    },
    "answer": "This is the JSON answer."
}
```
"""
        }
        
        result = reasoner.parse_response(response)
        
        assert result["thought"] == "This is a test thought in JSON."
        assert result["action"]["name"] == "search"
        assert result["action"]["params"]["query"] == "json test"
        assert result["answer"] == "This is the JSON answer."
    
    @pytest.mark.asyncio
    async def test_extract_json_from_response(self, reasoner):
        """Test extracting JSON from response."""
        content = """
Some content before JSON.

{
    "key1": "value1",
    "key2": 42,
    "key3": [1, 2, 3]
}

Some content after JSON.
"""
        
        result = reasoner._extract_json_from_response(content)
        
        assert result["key1"] == "value1"
        assert result["key2"] == 42
        assert result["key3"] == [1, 2, 3]
    
    @pytest.mark.asyncio
    async def test_reason(self, reasoner):
        """Test the full reasoning process."""
        input_data = {
            "query": "What is the capital of France?"
        }
        
        # Mock the call_model method to return controllable responses
        with patch.object(reasoner, 'call_model', new_callable=AsyncMock) as mock_call_model:
            # First iteration - think and act
            mock_call_model.side_effect = [
                {"content": """Thought: I need to find information about France's capital.

Action: search(query="capital of France")"""},
                # Second iteration - receive result and answer
                {"content": """Thought: Based on the search results, I now know that Paris is the capital of France.

Answer: The capital of France is Paris."""},
                # Final answer if needed
                {"content": "Answer: The capital of France is Paris."}
            ]
            
            result = await reasoner.reason(input_data)
            
            # Verify the result contains expected fields
            assert "query" in result
            assert "reasoning_trace" in result
            assert "actions" in result
            assert "observations" in result
            assert "iterations" in result
            assert "stopping_reason" in result
            assert "answer" in result
            
            # Verify specific values
            assert result["query"] == "What is the capital of France?"
            assert len(result["reasoning_trace"]) == 2
            assert len(result["actions"]) == 1
            assert result["iterations"] == 2
            assert result["stopping_reason"] == "answer_found"
            assert "Paris" in result["answer"]
            
            # Verify model was called for each iteration (but not for final answer in this case)
            assert mock_call_model.call_count == 2
    
    @pytest.mark.asyncio
    async def test_reason_no_answer(self, reasoner):
        """Test reasoning process that reaches max iterations without an answer."""
        input_data = {
            "query": "What is the meaning of life?"
        }
        
        # Mock the call_model method to return responses without an answer
        with patch.object(reasoner, 'call_model', new_callable=AsyncMock) as mock_call_model:
            # All iterations just think and act, no answer
            mock_call_model.side_effect = [
                {"content": "Thought: I need to search for meaning of life.\n\nAction: search(query=\"meaning of life\")"},
                {"content": "Thought: I need more philosophical sources.\n\nAction: search(query=\"philosophical meaning of life\")"},
                {"content": "Thought: I should look for religious perspectives.\n\nAction: search(query=\"religious meaning of life\")"},
                # Final answer when max iterations reached
                {"content": "Answer: The meaning of life is a philosophical question that has been debated throughout human history."}
            ]
            
            result = await reasoner.reason(input_data)
            
            # Verify specific values
            assert result["iterations"] == 3  # max_iterations set to 3 in fixture
            assert result["stopping_reason"] == "max_iterations_reached"
            assert "meaning of life" in result["answer"].lower()
            
            # Verify model was called for each iteration + final answer
            assert mock_call_model.call_count == 4
    
    @pytest.mark.asyncio
    async def test_reason_with_error(self, reasoner):
        """Test reasoning process with error handling."""
        input_data = {
            "query": "Test error handling"
        }
        
        # Test with a tool executor that raises an exception
        async def error_tool_executor(name, params):
            if name == "search":
                raise Exception("Search error")
            return "Result"
        
        reasoner.tool_executor = error_tool_executor
        
        # Mock the call_model method
        with patch.object(reasoner, 'call_model', new_callable=AsyncMock) as mock_call_model:
            mock_call_model.side_effect = [
                {"content": "Thought: Test thought.\n\nAction: search(query=\"test\")"},
                {"content": "Thought: I see there was an error. Let me try something else.\n\nAnswer: Error handled."}
            ]
            
            result = await reasoner.reason(input_data)
            
            assert "Error" in result["observations"][0]
            assert result["stopping_reason"] == "answer_found" 