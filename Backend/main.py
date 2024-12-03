from app.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import applications, workflow, email, gmail
from app.database import init_db, get_database
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

@app.on_event("startup")
async def startup():
    logger.info("Starting up FastAPI application")
    try:
        await init_db()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

@app.get("/api")
async def read_root():
    logger.info("Root endpoint accessed")
    try:
        # Test database connection
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