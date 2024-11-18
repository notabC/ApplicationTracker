# backend/app/services/application_service.py
from bson import ObjectId
from typing import List, Optional
from ..models.application import Application
from ..database import get_database

class ApplicationService:
    def __init__(self):
        self.collection_name = "applications"

    async def get_collection(self):
        db = await get_database()
        return db[self.collection_name]

    async def get_all(self) -> List[Application]:
        collection = await self.get_collection()
        applications = []
        async for app in collection.find():
            app["id"] = str(app.pop("_id"))
            applications.append(Application.model_validate(app))
        return applications

    async def get_by_id(self, application_id: str) -> Optional[Application]:
        collection = await self.get_collection()
        app = await collection.find_one({"_id": ObjectId(application_id)})
        if app:
            app["id"] = str(app.pop("_id"))
            return Application.model_validate(app)
        return None

    async def create(self, application: Application) -> Application:
        collection = await self.get_collection()
        application_dict = application.model_dump()
        application_dict["_id"] = ObjectId()
        del application_dict["id"]
        await collection.insert_one(application_dict)
        return application

    async def update(self, application_id: str, application: Application) -> Optional[Application]:
        collection = await self.get_collection()
        application_dict = application.model_dump()
        application_dict["_id"] = ObjectId(application_id)
        del application_dict["id"]
        result = await collection.replace_one(
            {"_id": ObjectId(application_id)},
            application_dict
        )
        if result.modified_count:
            return application
        return None

    async def delete(self, application_id: str) -> bool:
        collection = await self.get_collection()
        result = await collection.delete_one({"_id": ObjectId(application_id)})
        return result.deleted_count > 0