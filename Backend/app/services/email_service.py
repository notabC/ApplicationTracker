# app/services/email_service.py
from bson import ObjectId
from typing import List, Optional, Dict
from ..models.email import Email
from ..database import get_database

class EmailService:
    def __init__(self):
        self.collection_name = "emails"

    async def get_collection(self):
        db = await get_database()
        return db[self.collection_name]

    async def get_all(self, user: Dict) -> List[Email]:
        collection = await self.get_collection()
        emails = []
        async for email in collection.find({"user_email": user["email"]}):
            email["id"] = str(email.pop("_id"))
            emails.append(Email.model_validate(email))
        return emails

    async def create(self, email: Email, user: Dict) -> Email:
        collection = await self.get_collection()
        email_dict = email.model_dump()
        email_dict["_id"] = ObjectId()
        email_dict["user_id"] = user["id"]
        email_dict["user_email"] = user["email"]
        email_dict["id"]
        await collection.insert_one(email_dict)
        return email

    async def mark_as_processed(self, email_ids: List[str], user: Dict) -> bool:
        collection = await self.get_collection()
        result = await collection.update_many(
            {
                "_id": {"$in": [ObjectId(id) for id in email_ids]},
                "user_email": user["email"]  # Only update user's own emails
            },
            {"$set": {"processed": True}}
        )
        return result.modified_count > 0
    
    async def delete_all(self, user_email: str) -> bool:
        collection = await self.get_collection()
        result = await collection.delete_many({"user_email": user_email})
        return result.deleted_count > 0