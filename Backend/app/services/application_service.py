# backend/app/services/application_service.py
from bson import ObjectId
from typing import List, Optional
from app.models.application import Application
from app.database import get_database
import logging
import asyncio

logger = logging.getLogger(__name__)

class ApplicationService:
    def __init__(self):
        self.collection_name = "applications"

    async def get_collection(self):
        # Ensure we have an event loop
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        db = await get_database()
        return db[self.collection_name]

    async def get_all(self) -> List[Application]:
        try:
            collection = await self.get_collection()
            applications = []
            cursor = collection.find()
            async for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                applications.append(Application.model_validate(doc))
            return applications
        except Exception as e:
            logger.error(f"Error in get_all: {str(e)}")
            raise

    async def get_by_id(self, application_id: str) -> Optional[Application]:
        try:
            collection = await self.get_collection()
            doc = await collection.find_one({"_id": ObjectId(application_id)})
            if doc:
                doc["id"] = str(doc.pop("_id"))
                return Application.model_validate(doc)
            return None
        except Exception as e:
            logger.error(f"Error in get_by_id: {str(e)}")
            return None