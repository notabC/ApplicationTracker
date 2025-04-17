# Agent Reasoners

This directory contains implementations of various reasoning approaches for language model agents, including the ReAct reasoning framework.

## ReAct Reasoner

The ReAct (Reasoning and Acting) approach interleaves reasoning traces and task-specific actions in a synergistic way. This framework prompts language models to generate both reasoning traces and task-specific actions, and observe the results of those actions.

### Key Components

1. **ReActReasoner Class** (`reasoners/react_reasoner.py`): The core implementation of the ReAct reasoning approach.

2. **ToolExecutor Class** (`tools/tool_executor.py`): Handles tool registration and execution for the reasoner.

3. **Calculator Tools** (`tools/calculator.py`): Sample implementation of tools for solving math problems.

4. **Prompt Templates** (`prompts/react_prompts.py`): Templates for generating effective prompts for the ReAct framework.

5. **Command-line Interface** (`tools/calculator_interface.py`): A simple CLI for testing the reasoner with calculator tools.

### How It Works

ReAct reasoning follows a cyclical process:

1. **Think** - The model generates a reasoning trace
2. **Act** - The model chooses an action to take
3. **Observe** - The result of the action is observed
4. **Repeat** - The cycle continues until a stopping condition is met

This process allows the model to:
- Break down complex problems into steps
- Use tools to gather information or perform actions
- Maintain a reasoning trace for better transparency
- Arrive at better answers through structured reasoning

### Using the ReAct Reasoner

To use the ReAct reasoner in your application:

```python
from app.agents.reasoners.react_reasoner import ReActReasoner
from app.agents.tools.tool_executor import ToolExecutor

# 1. Initialize a tool executor and register tools
tool_executor = ToolExecutor()
# Register your tools...

# 2. Initialize the reasoner with your model
reasoner = ReActReasoner(
    model=your_llm_model,
    name="Your Reasoner Name",
    tools=tool_executor.get_tool_specs(),
    max_iterations=5  # Adjust as needed
)

# 3. Execute the reasoning process
result = await reasoner.reason({
    "query": "Your query here",
    "context": "Additional context"
}, tool_executor)

# 4. Use the results
final_answer = result["answer"]
reasoning_trace = result["reasoning_trace"]
```

### Testing with Calculator Tools

A simple calculator tool implementation is provided for testing. To run it:

```bash
# Run with a specific query
python -m app.agents.tools.calculator_interface "What is the square root of 16?"

# Run in interactive mode
python -m app.agents.tools.calculator_interface
```

## Creating Custom Tools

To create custom tools for the ReAct reasoner:

1. Create a new module with your tool implementations
2. Create functions to register the tools with a ToolExecutor
3. Use the tool executor with the ReAct reasoner

Example:

```python
# 1. Define your tool class
class MyCustomTool:
    def my_function(self, param1, param2):
        # Implementation
        return result

# 2. Create a registration function
def register_my_tools(tool_executor):
    tool = MyCustomTool()
    
    tool_executor.register_tool(
        name="my_function",
        func=tool.my_function,
        description="Description of what the tool does",
        parameter_descriptions={
            "param1": "Description of param1",
            "param2": "Description of param2"
        }
    )
```

## Future Improvements

Potential enhancements to this implementation:

1. Add support for structured outputs
2. Implement memory/history management for extended conversations
3. Add support for more complex tool formats
4. Improve error handling and recovery strategies
5. Support for tool selection based on dynamic context 