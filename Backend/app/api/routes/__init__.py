"""
API routes package.

This package contains all the API routes for the application.
"""

from fastapi import APIRouter

# Create main router
api_router = APIRouter()

# Import and include routes
# Note: Using a function to avoid circular imports
def setup_routes():
    # Import route modules here to avoid circular imports
    try:
        from app.api.routes import react_reasoning
        api_router.include_router(react_reasoning.router, prefix="/reasoning", tags=["reasoning"])
    except ImportError as e:
        import logging
        logging.getLogger(__name__).error(f"Error importing react_reasoning routes: {str(e)}")
    
    # These routes don't exist yet but are referenced - we'll handle them gracefully
    # When they're implemented, uncomment these lines
    
    # try:
    #     from app.api.routes import users
    #     api_router.include_router(users.router, prefix="/users", tags=["users"])
    # except ImportError as e:
    #     import logging
    #     logging.getLogger(__name__).error(f"Error importing users routes: {str(e)}")
    
    # try:
    #     from app.api.routes import ost_profile
    #     api_router.include_router(ost_profile.router, prefix="/ost-profile", tags=["ost-profile"])
    # except ImportError as e:
    #     import logging
    #     logging.getLogger(__name__).error(f"Error importing ost_profile routes: {str(e)}")
    
    # try:
    #     from app.api.routes import job_search
    #     api_router.include_router(job_search.router, prefix="/job-search", tags=["job-search"])
    # except ImportError as e:
    #     import logging
    #     logging.getLogger(__name__).error(f"Error importing job_search routes: {str(e)}")
    
    # try:
    #     from app.api.routes import resume
    #     api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
    # except ImportError as e:
    #     import logging
    #     logging.getLogger(__name__).error(f"Error importing resume routes: {str(e)}") 