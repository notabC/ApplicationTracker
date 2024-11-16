# backend/app/database.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db = Database()

async def get_database() -> AsyncIOMotorDatabase:
    if db.client is None:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.db = db.client[settings.DATABASE_NAME]
    return db.db

async def init_db():
    if db.client is None:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.db = db.client[settings.DATABASE_NAME]

async def close_db():
    if db.client is not None:
        db.client.close()
        db.client = None
        db.db = None