from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    
db = Database()

async def get_database():
    if db.client is None:
        # Create new client connection
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        try:
            # Verify the connection
            await db.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB!")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    return db.client[settings.DATABASE_NAME]

async def init_db():
    if db.client is None:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        try:
            # Verify the connection
            await db.client.admin.command('ping')
            logger.info("MongoDB initialization successful!")
            # Print the database name we're connecting to
            logger.info(f"Connected to database: {settings.DATABASE_NAME}")
            # List all collections in the database
            db_instance = db.client[settings.DATABASE_NAME]
            collections = await db_instance.list_collection_names()
            logger.info(f"Available collections: {collections}")
        except Exception as e:
            logger.error(f"MongoDB initialization failed: {e}")
            raise

async def close_db():
    if db.client is not None:
        db.client.close()
        logger.info("MongoDB connection closed")