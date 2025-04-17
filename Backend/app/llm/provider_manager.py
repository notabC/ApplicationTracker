"""
LLM provider manager module.

This module provides a centralized way to access and manage LLM providers.
"""

import logging
import os
from typing import Any, Dict, List, Optional

# Import the API wrapper
from app.agents.rate_limited_api import RateLimitedAPI

logger = logging.getLogger(__name__)

# Try to import the Google GenerativeAI module, but handle the case where it's not available
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    logger.warning("Google GenerativeAI module not available. Install with: pip install google-generativeai")
    GENAI_AVAILABLE = False

class LLMProvider:
    """
    Base provider class for language model interactions.
    """
    
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        """Initialize the provider with a model name."""
        self.model_name = model_name
        self.api = RateLimitedAPI(model_name=model_name)
    
    def get_chat_model(self) -> Any:
        """
        Get the chat model for this provider.
        
        Returns:
            The provider-specific chat model
        """
        return self.api


class MockProvider:
    """
    Mock provider for use when no real providers are available.
    This can be used for testing or when API keys are not configured.
    """
    
    def __init__(self, model_name: str = "mock-model"):
        """Initialize the mock provider."""
        self.model_name = model_name
        logger.warning(f"Using MockProvider with model {model_name} - this will not produce real responses!")
    
    def get_chat_model(self) -> Any:
        """
        Get a mock chat model.
        
        Returns:
            A simple mock model object
        """
        # Simple mock model that returns predefined responses
        class MockModel:
            async def generate(self, messages):
                return MockResponse("This is a mock response. No real LLM provider is configured.")
            
            async def generate_content(self, prompt):
                return MockResponse("This is a mock response. No real LLM provider is configured.")
                
            async def invoke(self, **kwargs):
                return {
                    "content": "This is a mock response. No real LLM provider is configured.",
                    "mock": True
                }
        
        return MockModel()


class MockResponse:
    """Simple mock response object."""
    
    def __init__(self, text):
        self.text = text
        self.choices = [MockChoice(text)]


class MockChoice:
    """Mock choice for the response."""
    
    def __init__(self, text):
        self.message = MockMessage(text)


class MockMessage:
    """Mock message for the response."""
    
    def __init__(self, text):
        self.content = text


class ProviderManager:
    """
    Manager for accessing different LLM providers.
    
    This class provides a unified interface to access different LLM providers
    and handles provider selection, caching, and configuration.
    """
    
    def __init__(self, default_provider: str = "gemini", allow_mock: bool = True):
        """
        Initialize the provider manager.
        
        Args:
            default_provider: The default provider to use
            allow_mock: Whether to allow using a mock provider as fallback
        """
        self.providers = {}
        self.default_provider = default_provider
        self.allow_mock = allow_mock
        
        # Initialize providers based on available API keys
        self._init_providers()
        
        # Add mock provider as fallback if no real providers are available
        if not self.providers and self.allow_mock:
            self.providers["mock"] = MockProvider()
            self.default_provider = "mock"
            logger.warning("No real LLM providers configured. Using mock provider as fallback.")
        
        logger.info(f"Initialized ProviderManager with {len(self.providers)} providers")
        if not self.providers:
            logger.error("No LLM providers configured and mock provider not allowed! API calls will fail.")
    
    def _init_providers(self):
        """Initialize available providers based on environment variables."""
        # Check for GEMINI_API_KEY
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        if gemini_api_key and GENAI_AVAILABLE:
            try:
                # Configure the Gemini API
                genai.configure(api_key=gemini_api_key)
                self.providers["gemini"] = LLMProvider(model_name="gemini-1.5-flash")
                logger.info("Gemini provider configured successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini provider: {str(e)}")
        else:
            if not gemini_api_key:
                logger.warning("GEMINI_API_KEY not found in environment variables")
            if not GENAI_AVAILABLE:
                logger.warning("Google GenerativeAI module not available")
    
    def get_provider(self, provider_name: Optional[str] = None) -> Any:
        """
        Get a provider by name, or the default provider if not specified.
        
        Args:
            provider_name: Optional name of the provider to get
            
        Returns:
            The requested provider
            
        Raises:
            ValueError: If the requested provider is not available and no fallback exists
        """
        provider = provider_name or self.default_provider
        
        if provider not in self.providers:
            if not self.providers:
                raise ValueError(f"No LLM providers are available. Please set up API keys.")
            
            logger.warning(f"Provider '{provider}' not found, using default provider '{self.default_provider}'")
            provider = self.default_provider
        
        return self.providers[provider]
    
    def list_available_providers(self) -> List[str]:
        """
        Get a list of available provider names.
        
        Returns:
            List of provider names that are currently available
        """
        return list(self.providers.keys())
    
    def get_provider_info(self) -> Dict[str, Any]:
        """
        Get information about the available providers.
        
        Returns:
            Dictionary with provider information
        """
        return {
            "available_providers": self.list_available_providers(),
            "default_provider": self.default_provider,
            "mock_allowed": self.allow_mock
        } 