"""
Rate-limited API module - implements AI model interface with caching and rate limiting.
"""

import time
import asyncio
import logging
import random
import os
from typing import Dict, Any, Optional, Callable, Type, TypeVar
import backoff
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable, GoogleAPIError

from .base_agent import AIModelInterface

# Set up logging
logger = logging.getLogger(__name__)

T = TypeVar('T')

class SimpleCache:
    """
    Generic caching implementation that can be used across different workflows.
    """
    def __init__(self, max_size: int = 100):
        self.cache = {}
        self.max_size = max_size
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Get a value from cache"""
        if key in self.cache:
            self.hits += 1
            return self.cache[key]
        self.misses += 1
        return None
    
    def set(self, key: str, value: Any) -> None:
        """Set a value in cache"""
        if len(self.cache) >= self.max_size:
            # Remove a random item if cache is full
            random_key = random.choice(list(self.cache.keys()))
            del self.cache[random_key]
        self.cache[key] = value
    
    def clear(self) -> None:
        """Clear the entire cache"""
        self.cache = {}
    
    def remove(self, key: str) -> None:
        """Remove a specific key from cache"""
        if key in self.cache:
            del self.cache[key]
            
    @property
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total = self.hits + self.misses
        hit_rate = self.hits / total if total > 0 else 0
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": hit_rate
        }


class RateLimitedAPI(AIModelInterface):
    """
    Rate-limited wrapper for any AI API that implements exponential backoff
    and caching to optimize API usage.
    """
    def __init__(
        self, 
        model_name: str = "gemini-1.5-flash",
        cache: Optional[SimpleCache] = None, 
        min_delay: float = 1.0, 
        max_delay: float = 5.0,
        max_retries: int = 5
    ):
        """
        Initialize the rate-limited API.
        
        Args:
            model_name: The name of the model to use
            cache: Optional cache instance
            min_delay: Minimum delay between API calls
            max_delay: Maximum delay for exponential backoff
            max_retries: Maximum number of retries on failure
        """
        self.model_name = model_name
        self.cache = cache or SimpleCache(max_size=200)
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.max_retries = max_retries
        self.last_call_time = 0
        self.consecutive_errors = 0
        self.total_calls = 0
        self.successful_calls = 0
        self._model = None
        
        # Initialize model if API key is available
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self._model = genai.GenerativeModel(model_name)
        else:
            logger.warning("GEMINI_API_KEY not found in environment variables")
    
    @property
    def model(self):
        """Get the underlying model"""
        return self._model
    
    @model.setter
    def model(self, model):
        """Set the underlying model"""
        self._model = model
    
    @property
    def model_info(self) -> Dict[str, Any]:
        """Get information about the model being used"""
        return {
            "model_name": self.model_name,
            "total_calls": self.total_calls,
            "successful_calls": self.successful_calls,
            "success_rate": self.successful_calls / self.total_calls if self.total_calls > 0 else 0,
            "cache_stats": self.cache.stats,
            "consecutive_errors": self.consecutive_errors
        }
    
    # Regular synchronous method with backoff decorator
    @backoff.on_exception(
        backoff.expo,
        (ResourceExhausted, ServiceUnavailable),
        max_tries=5,
        factor=2,
        jitter=backoff.full_jitter
    )
    def generate_content(self, prompt: str) -> Any:
        """
        Generate content from the AI model with rate limiting and caching.
        
        Args:
            prompt: The input prompt to send to the model
            
        Returns:
            The model's response
        """
        # First check if we have this in cache
        cache_key = hash(prompt)
        cached_result = self.cache.get(cache_key)
        if cached_result:
            logger.debug("Using cached result")
            return cached_result
        
        # Ensure we have a model
        if not self._model:
            raise ValueError("Model not initialized. Ensure GEMINI_API_KEY is set.")
        
        # Ensure minimum delay between API calls
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        # Calculate delay based on consecutive errors (exponential backoff)
        delay = self.min_delay * (2 ** self.consecutive_errors)
        delay = min(delay, self.max_delay)  # Cap at max_delay
        
        if time_since_last_call < delay:
            sleep_time = delay - time_since_last_call
            logger.debug(f"Rate limiting: Sleeping for {sleep_time:.2f}s")
            time.sleep(sleep_time)
        
        try:
            logger.debug(f"Making API call (delay: {delay:.2f}s)")
            self.total_calls += 1
            response = self._model.generate_content(prompt)
            
            # Reset consecutive errors on success
            self.consecutive_errors = 0
            self.successful_calls += 1
            
            # Update last call time
            self.last_call_time = time.time()
            
            # Cache the result
            self.cache.set(cache_key, response)
            
            return response
        
        except (ResourceExhausted, ServiceUnavailable) as e:
            # Increment consecutive errors to increase backoff
            self.consecutive_errors += 1
            logger.warning(f"API Rate limit hit. Consecutive errors: {self.consecutive_errors}")
            # Let backoff handler retry
            raise
            
        except GoogleAPIError as e:
            logger.error(f"Google API Error: {str(e)}")
            # For other API errors, also backoff but handle them specially
            self.consecutive_errors += 1
            # Create a simple response object with error info
            class ErrorResponse:
                def __init__(self, error_msg):
                    self.text = f"Error occurred: {error_msg}. Using fallback response."
            
            return ErrorResponse(str(e))
        
        except Exception as e:
            logger.exception(f"Unexpected error in generate_content: {str(e)}")
            # For unexpected errors, return a stub response
            class ErrorResponse:
                def __init__(self, error_msg):
                    self.text = f"Unexpected error: {error_msg}. Using fallback response."
            
            return ErrorResponse(str(e))
    
    # Async wrapper for the synchronous method
    async def agenerate_content(self, prompt: str) -> Any:
        """
        Async wrapper for generate_content.
        Offloads the work to a thread pool to avoid blocking the event loop.
        
        Args:
            prompt: The input prompt to send to the model
            
        Returns:
            The model's response
        """
        return await asyncio.to_thread(self.generate_content, prompt) 