from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    
db = Database()

async def get_database():
    if db.client is None:
        try:
            # Get MongoDB URL from environment
            mongodb_url = os.environ.get('MONGODB_URL', settings.MONGODB_URL)

            # Create new client connection
            db.client = AsyncIOMotorClient(
                mongodb_url,
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
    return db.client[os.environ.get('DATABASE_NAME', settings.DATABASE_NAME)]

async def init_db():
    db = await get_database()
    # Create indexes
    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("id", unique=True)
    await db["applications"].create_index([
        ("user_email", 1),
        ("_id", 1)
    ])
    await db["applications"].create_index("user_id")

async def close_db():
    if db.client is not None:
        db.client.close()
        db.client = None
        logger.info("MongoDB connection closed")