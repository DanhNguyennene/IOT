from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo import ReturnDocument
import logging
from sqlmodel.ext.asyncio.session import AsyncSession
from bson import ObjectId
from passlib.context import CryptContext
from pydantic import BaseModel, Field

class SignupFaceModel(BaseModel):
    password: str = Field(min_length=6)
class LoginFaceModel(BaseModel):
    email: str

pwd_context = CryptContext(schemes=["bcrypt"])
class FaceIDService:
    async def get_faceid_status(self, user: dict, db: AsyncSession):
        """Check if FaceID is enabled for the user"""
        user_id = str(user['user']['user_id'])
        user_data = await db["USERS"].find_one({"_id": ObjectId(user_id)})
        # print(user_data)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        faceid_enabled = bool(user_data.get("faceID"))
        
        return {
            "success": True,
            "enabled": faceid_enabled
        }

    async def loginface(self, user: LoginFaceModel, db: AsyncSession):
        """Login using FaceID"""
        user_data = await db["USERS"].find_one({"email": user.email})        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user_data.get("faceID"):
            raise HTTPException(status_code=400, detail="FaceID not registered")
        
        # Call AI app for FaceID verification
        ai_app_response = await self.call_ai_app_for_login(user_data)
        return {
            "message": "FaceID login successful",
            "data": ai_app_response
        }

    async def signupface(self, user: dict,password:SignupFaceModel, db: AsyncSession):
        """Register FaceID"""
        user_id = str(user['user']['user_id'])
        user_data = await db["USERS"].find_one({"_id": ObjectId(user_id)})
        # print(user_data['password'])
        # print(password.password)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not pwd_context.verify( password.password,user_data['password']):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Wrong password"
            )
        # print(user_data)
        ai_app_response = await self.call_ai_app_for_signup(user_data)
        
        # Save FaceID to MongoDB
        faceid_data = ai_app_response.get("faceID")
        if faceid_data:
            await db["USERS"].update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"faceID": faceid_data}}
            )
        # print(ai_app_response)
        return {
            "message": "FaceID registered successfully",
            "data": ai_app_response
        }

    async def call_ai_app_for_login(self, user: dict):
        """Call AI app to verify FaceID"""
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:5001/start-camera-login",
                json={"email": user["email"]}
            )
            response = await client.post(
                "http://localhost:5001/stop-camera",
            )
        response.raise_for_status()
        return response.json()

    async def call_ai_app_for_signup(self, user: dict):
        """Call AI app to enroll FaceID"""
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:5001/start-camera-signup",
                json={"email": user["email"], "password": user["password"]}
            )

            response = await client.post(
                "http://localhost:5001/stop-camera",
            )
            print(response.json())
        response.raise_for_status()
        return response.json()
    async def disable_faceid(self, user: dict, db: AsyncSession):
        """Disable FaceID for the user"""
        user_id = str(user['user']['user_id'])
        print(user_id)
        user_data = await db["USERS"].find_one({"_id": ObjectId(user_id)})
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove FaceID from MongoDB
        await db["USERS"].update_one(
            {"_id": ObjectId(user_id)},
            {"$unset": {"faceID": []}}
        )
        user_data = await db["USERS"].find_one({"_id": ObjectId(user_id)})
        return {
            "message": "FaceID disabled successfully"
        }