"""
Command-line interface for the calculator tools.

This module provides a command-line interface for interacting with the
calculator tools, allowing for simple testing without needing a full UI.
"""

import argparse
import asyncio
import logging
import os
import sys
from dotenv import load_dotenv

# Add the project root to the Python path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from app.agents.reasoners.react_reasoner import ReActReasoner
from app.agents.tools.tool_executor import ToolExecutor
from app.agents.tools.calculator import register_calculator_tools
from app.llm.provider_manager import ProviderManager


# Setup logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def main():
    """Run the calculator interface."""
    # Set up command-line argument parsing
    parser = argparse.ArgumentParser(description="Calculator Tool Interface")
    parser.add_argument("query", type=str, nargs="?", 
                      help="Math query to process (e.g., 'What is the area of a circle with radius 5?')")
    parser.add_argument("--max-iterations", type=int, default=5,
                      help="Maximum number of reasoning iterations (default: 5)")
    parser.add_argument("--debug", action="store_true",
                      help="Enable debug logging")
    
    args = parser.parse_args()
    
    # Set debug logging if requested
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Load environment variables
    load_dotenv()
    
    # Initialize the provider manager to get the language model
    provider_manager = ProviderManager()
    model = provider_manager.get_provider().get_chat_model()
    
    # Initialize the tool executor and register calculator tools
    tool_executor = ToolExecutor()
    register_calculator_tools(tool_executor)
    
    # List available tools
    print("Available tools:")
    for tool in tool_executor.get_tool_specs():
        print(f"- {tool['name']}: {tool['description']}")
    
    # Create the ReActReasoner
    reasoner = ReActReasoner(
        model=model,
        name="Calculator Assistant",
        tools=tool_executor.get_tool_specs(),
        max_iterations=args.max_iterations
    )
    
    # If a query was provided via command line, process it
    if args.query:
        await process_query(args.query, reasoner, tool_executor)
    else:
        # Otherwise, enter interactive mode
        await interactive_mode(reasoner, tool_executor)


async def process_query(query, reasoner, tool_executor):
    """Process a single query and display the results."""
    print(f"\nProcessing query: {query}")
    
    # Execute the reasoning process
    result = await reasoner.reason({
        "query": query,
        "context": "You are a helpful math assistant that can solve problems."
    }, tool_executor)
    
    # Display the results
    print_results(result)


async def interactive_mode(reasoner, tool_executor):
    """Run an interactive session where users can enter multiple queries."""
    print("\nEntering interactive mode. Type 'exit' to quit.")
    
    while True:
        # Get the query from the user
        query = input("\nEnter your math question (or 'exit' to quit): ")
        
        if query.lower() in ("exit", "quit", "q"):
            break
        
        # Process the query
        await process_query(query, reasoner, tool_executor)


def print_results(result):
    """Pretty-print the reasoning results."""
    print("\n" + "="*50)
    print("REASONING RESULTS")
    print("="*50)
    
    print(f"\nQuery: {result['query']}")
    
    if result['answer']:
        print(f"\nAnswer: {result['answer']}")
    else:
        print("\nNo definitive answer found.")
    
    print(f"\nIterations: {result['iterations']}")
    print(f"Stopping Reason: {result['stopping_reason']}")
    
    print("\n" + "-"*50)
    print("REASONING TRACE")
    print("-"*50)
    
    # Display the reasoning steps
    thoughts = result['reasoning_trace']['thoughts']
    actions = result['reasoning_trace']['actions']
    observations = result['reasoning_trace']['observations']
    
    for i, (thought, action, observation) in enumerate(zip(thoughts, actions, observations)):
        print(f"\nStep {i+1}:")
        print(f"Thought: {thought}")
        
        if action['name'] == 'answer':
            print(f"Final Answer: {action['input']}")
        else:
            print(f"Action: {action['name']}")
            print(f"Action Input: {action['input']}")
            print(f"Observation: {observation}")


if __name__ == "__main__":
    asyncio.run(main()) 