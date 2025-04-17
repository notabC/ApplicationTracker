"""
Test script for the ReActReasoner with calculator tools.

This script demonstrates how the ReActReasoner works with the calculator tools
to solve math problems through a multi-step reasoning process.
"""

import asyncio
import os
import logging
from dotenv import load_dotenv

from app.agents.reasoners.react_reasoner import ReActReasoner
from app.agents.tools.tool_executor import ToolExecutor
from app.agents.tools.calculator import register_calculator_tools
from app.llm.provider_manager import ProviderManager


# Setup logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def main():
    """Run a demonstration of the ReActReasoner with calculator tools."""
    # Load environment variables
    load_dotenv()
    
    # Initialize the provider manager
    provider_manager = ProviderManager()
    
    # Get the default model from the provider manager
    model = provider_manager.get_provider().get_chat_model()
    
    # Initialize the tool executor
    tool_executor = ToolExecutor()
    
    # Register calculator tools
    register_calculator_tools(tool_executor)
    
    # Get all tool specifications
    tool_specs = tool_executor.get_tool_specs()
    
    # Initialize the ReActReasoner
    reasoner = ReActReasoner(
        model=model,
        name="Calculator ReAct Agent",
        tools=tool_specs,
        max_iterations=5,
        stop_at_answer=True
    )
    
    # Define a test query that requires multiple steps
    test_query = "If I have a square with side length 4, what is its area? Then, what would be the area of a circle with the same perimeter as this square?"
    
    logger.info(f"Starting reasoning process for query: {test_query}")
    
    # Execute the reasoning process
    result = await reasoner.reason({
        "query": test_query,
        "context": "You are a helpful math assistant that can solve geometry problems."
    }, tool_executor)
    
    # Display the results
    print("\n==== REASONING TRACE ====")
    print(f"Query: {result['query']}")
    print(f"Final Answer: {result['answer']}")
    print(f"Iterations: {result['iterations']}")
    print(f"Stopping Reason: {result['stopping_reason']}")
    
    print("\n==== DETAILED TRACE ====")
    for i, (thought, action, observation) in enumerate(zip(
        result['reasoning_trace']['thoughts'],
        result['reasoning_trace']['actions'],
        result['reasoning_trace']['observations']
    )):
        print(f"\nStep {i+1}:")
        print(f"Thought: {thought}")
        print(f"Action: {action['name']}({action['input']})")
        print(f"Observation: {observation}")


if __name__ == "__main__":
    asyncio.run(main()) 