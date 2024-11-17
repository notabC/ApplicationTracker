from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    
db = Database()

async def get_database():
    if db.client is None:
        try:
            # Ensure we have an event loop
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # Create new client connection
            db.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000  # 5 second timeout
            )
            # Test the connection
            await db.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB!")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            if db.client:
                db.client.close()
                db.client = None
            raise
    return db.client[settings.DATABASE_NAME]

async def init_db():
    try:
        # Ensure we have an event loop
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        if db.client is None:
            db.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000
            )
            # Test the connection
            await db.client.admin.command('ping')
            logger.info("MongoDB initialization successful!")
            logger.info(f"Connected to database: {settings.DATABASE_NAME}")
            
            # List collections
            db_instance = db.client[settings.DATABASE_NAME]
            collections = await db_instance.list_collection_names()
            logger.info(f"Available collections: {collections}")
    except Exception as e:
        logger.error(f"MongoDB initialization failed: {str(e)}")
        if db.client:
            db.client.close()
            db.client = None
        raise

async def close_db():
    if db.client is not None:
        db.client.close()
        db.client = None
        logger.info("MongoDB connection closed")