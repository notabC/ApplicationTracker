from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from mangum import Mangum
from app.routers import applications, workflow, email
from app.database import init_db
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(applications.router, prefix="/applications", tags=["applications"])
app.include_router(workflow.router, prefix="/workflow", tags=["workflow"])
app.include_router(email.router, prefix="/email", tags=["email"])

@app.on_event("startup")
async def startup():
    logger.info("Starting up FastAPI application")
    try:
        await init_db()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down FastAPI application")

@app.get("/")
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
            "collections": collections
        }
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return {
            "message": "Welcome to Job Tracker API",
            "status": "database error",
            "error": str(e)
        }

# Create handler for Vercel
# handler = Mangum(app, lifespan="off")

# uvicorn main:app --reload