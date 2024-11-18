# app/services/email_service.py
from bson import ObjectId
from typing import List, Optional
from ..models.email import Email
from ..database import get_database

class EmailService:
    def __init__(self):
        self.collection_name = "emails"

    async def get_collection(self):
        db = await get_database()
        return db[self.collection_name]

    async def get_all(self) -> List[Email]:
        collection = await self.get_collection()
        emails = []
        async for email in collection.find():
            email["id"] = str(email.pop("_id"))
            emails.append(Email.model_validate(email))
        return emails

    async def create(self, email: Email) -> Email:
        collection = await self.get_collection()
        email_dict = email.model_dump()
        email_dict["_id"] = ObjectId()
        del email_dict["id"]
        await collection.insert_one(email_dict)
        return email

    async def mark_as_processed(self, email_ids: List[str]) -> bool:
        print(email_ids)
        collection = await self.get_collection()
        result = await collection.update_many(
            {"_id": {"$in": [ObjectId(id) for id in email_ids]}},
            {"$set": {"processed": True}}
        )
        return result.modified_count > 0