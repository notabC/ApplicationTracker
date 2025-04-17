from app.config import settings
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.routers import applications, workflow, email, gmail, auth, ost  # Temporarily remove ost_application
from app.api.routes import api_router  # Import the main API router
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Job Tracker API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://trackwise.pro"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(workflow.router, prefix="/api/workflow", tags=["workflow"])
app.include_router(email.router, prefix="/api/emails", tags=["email"])
app.include_router(gmail.router, prefix="/api/gmail", tags=["gmail"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(ost.router, prefix="/api/ost", tags=["ost"])
# app.include_router(ost_application.router, prefix="/api/ost/applications", tags=["ost-applications"])

# Initialize and include API routes
from app.api.routes import setup_routes
setup_routes()  # Set up routes to avoid circular imports
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup():
    logger.info("Starting up FastAPI application")
    try:
        from app.database import init_db
        await init_db()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

@app.get("/api")
async def read_root():
    logger.info("Root endpoint accessed")
    try:
        # Test database connection
        from app.database import get_database
        db = await get_database()
        collections = await db.list_collection_names()
        logger.info(f"Database connection test successful. Collections: {collections}")
        return {
            "message": "Welcome to Job Tracker API",
            "status": "healthy",
            "database_connected": True,
            "collections": list(collections)
        }
    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")
        return {
            "message": "Welcome to Job Tracker API",
            "status": "database error",
            "error": str(e)
        }


# uvicorn main:app --reload