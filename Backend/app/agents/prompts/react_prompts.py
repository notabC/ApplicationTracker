"""
Prompt templates for the ReAct reasoning approach.

This module contains prompt templates used by the ReActReasoner to guide
the model through the Thought-Action-Observation reasoning cycle.
"""

REACT_SYSTEM_PROMPT = """You are an AI assistant that follows the ReAct framework, which involves Reasoning, Acting, and Observing to solve problems.

You are given a question and can use tools to help answer it.

For each step you need to:
1. Think: Reason about the current situation, what you know, and what you need to find out
2. Act: Choose a tool to use and the input for that tool
3. Observe: Receive the result of using the tool

# Format your response as:

Thought: <your reasoning about what to do next>
Action: <tool_name>
Action Input: <tool parameters as a JSON object>

The observation will be provided to you after each action.

If you believe you have the final answer, respond with:

Thought: <your final reasoning>
Answer: <the final answer to the original question>

# Available Tools:
{tool_descriptions}

# Important Rules:
- Always use the tools rather than trying to compute things yourself
- Be precise with your Action Input, using valid JSON format
- Continue with Thought/Action/Observation until you can confidently answer the question
- Don't make up information - if you don't know, use tools to find out
- Answer the original question directly and concisely
"""

REACT_PROMPT_TEMPLATE = """
# Question
{query}

# Context
{context}

# Reasoning History
{reasoning_history}

Now, continue with the next step in the ReAct framework (Thought, Action, or Answer):
"""

def format_tool_descriptions(tools):
    """
    Format the tool descriptions for inclusion in the system prompt.
    
    Args:
        tools: List of tool specification dictionaries
        
    Returns:
        Formatted string with tool descriptions
    """
    descriptions = []
    
    for tool in tools:
        tool_desc = f"## {tool['name']}\n{tool['description']}\n\nParameters:"
        
        for param in tool['parameters']:
            required = " (required)" if param.get('required', False) else ""
            tool_desc += f"\n- {param['name']}{required}: {param['description']}"
        
        descriptions.append(tool_desc)
    
    return "\n\n".join(descriptions)


def format_reasoning_history(thoughts, actions, observations):
    """
    Format the reasoning history for inclusion in the prompt.
    
    Args:
        thoughts: List of thought strings
        actions: List of action dictionaries
        observations: List of observation strings
        
    Returns:
        Formatted string with reasoning history
    """
    if not thoughts:
        return "No reasoning steps taken yet."
    
    history = []
    
    for i, (thought, action, observation) in enumerate(zip(thoughts, actions, observations)):
        step = f"## Step {i+1}:\n"
        step += f"Thought: {thought}\n"
        
        if isinstance(action, dict) and 'name' in action and 'input' in action:
            step += f"Action: {action['name']}\n"
            step += f"Action Input: {action['input']}\n"
        else:
            step += f"Action: {action}\n"
            
        step += f"Observation: {observation}"
        
        history.append(step)
    
    return "\n\n".join(history) 