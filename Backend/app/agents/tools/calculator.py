"""
Calculator tool for agent testing.

This module provides a basic calculator tool that can be used for testing
agent reasoners with mathematical operations.
"""

import math
import operator
from typing import Union, Dict, Any


class Calculator:
    """
    A simple calculator tool for testing agent reasoners.
    
    This class provides basic mathematical operations that can be registered
    with a ToolExecutor and used by reasoners during testing.
    """
    
    def __init__(self):
        """Initialize the calculator with basic operations."""
        self.operations = {
            "+": operator.add,
            "-": operator.sub,
            "*": operator.mul,
            "/": operator.truediv,
            "^": operator.pow,
            "sqrt": math.sqrt,
            "sin": math.sin,
            "cos": math.cos,
            "tan": math.tan,
            "log": math.log,
            "log10": math.log10,
            "exp": math.exp,
            "floor": math.floor,
            "ceil": math.ceil,
            "abs": abs
        }
    
    def calculate(self, expression: str) -> Union[float, str]:
        """
        Calculate the result of a simple mathematical expression.
        
        This method supports basic arithmetic operations (+, -, *, /, ^)
        and common mathematical functions.
        
        Args:
            expression: A string representation of a mathematical expression
        
        Returns:
            The calculated result as a float, or an error message if the
            expression couldn't be evaluated
        """
        try:
            # For safety, we'll evaluate the expression in a controlled way
            # rather than using eval()
            expr = expression.strip()
            
            # Check for simple binary operations
            for op in ["+", "-", "*", "/", "^"]:
                if op in expr:
                    parts = expr.split(op, 1)
                    if len(parts) == 2:
                        left = float(parts[0].strip())
                        right = float(parts[1].strip())
                        return self.operations[op](left, right)
            
            # Check for function calls like sqrt(4)
            for func in self.operations:
                if func not in ["+", "-", "*", "/", "^"] and expr.startswith(func + "("):
                    if expr.endswith(")"):
                        arg_str = expr[len(func)+1:-1].strip()
                        arg = float(arg_str)
                        return self.operations[func](arg)
            
            # If no operations found, try to parse as a single number
            return float(expr)
            
        except Exception as e:
            return f"Error calculating result: {str(e)}"
    
    def add(self, a: float, b: float) -> float:
        """Add two numbers."""
        return a + b
    
    def subtract(self, a: float, b: float) -> float:
        """Subtract b from a."""
        return a - b
    
    def multiply(self, a: float, b: float) -> float:
        """Multiply two numbers."""
        return a * b
    
    def divide(self, a: float, b: float) -> float:
        """Divide a by b."""
        if b == 0:
            raise ValueError("Division by zero")
        return a / b
    
    def power(self, base: float, exponent: float) -> float:
        """Calculate base raised to the power of exponent."""
        return math.pow(base, exponent)
    
    def square_root(self, number: float) -> float:
        """Calculate the square root of a number."""
        if number < 0:
            raise ValueError("Cannot calculate square root of negative number")
        return math.sqrt(number)


# Convenience functions for registering with ToolExecutor

def register_calculator_tools(tool_executor):
    """
    Register all calculator tools with a ToolExecutor instance.
    
    Args:
        tool_executor: The ToolExecutor instance to register tools with
    """
    calc = Calculator()
    
    tool_executor.register_tool(
        name="calculate",
        func=calc.calculate,
        description="Calculate the result of a simple mathematical expression",
        parameter_descriptions={
            "expression": "A string representing a mathematical expression (e.g., '2 + 2', 'sqrt(16)')"
        }
    )
    
    tool_executor.register_tool(
        name="add",
        func=calc.add,
        description="Add two numbers together",
        parameter_descriptions={
            "a": "The first number",
            "b": "The second number"
        }
    )
    
    tool_executor.register_tool(
        name="subtract",
        func=calc.subtract,
        description="Subtract the second number from the first",
        parameter_descriptions={
            "a": "The number to subtract from",
            "b": "The number to subtract"
        }
    )
    
    tool_executor.register_tool(
        name="multiply",
        func=calc.multiply,
        description="Multiply two numbers together",
        parameter_descriptions={
            "a": "The first number",
            "b": "The second number"
        }
    )
    
    tool_executor.register_tool(
        name="divide",
        func=calc.divide,
        description="Divide the first number by the second",
        parameter_descriptions={
            "a": "The dividend",
            "b": "The divisor (cannot be zero)"
        }
    )
    
    tool_executor.register_tool(
        name="power",
        func=calc.power,
        description="Calculate the first number raised to the power of the second",
        parameter_descriptions={
            "base": "The base number",
            "exponent": "The exponent"
        }
    )
    
    tool_executor.register_tool(
        name="square_root",
        func=calc.square_root,
        description="Calculate the square root of a number",
        parameter_descriptions={
            "number": "The number to calculate the square root of (must be non-negative)"
        }
    ) 