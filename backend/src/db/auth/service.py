from src.db.auth.schemas import UserLoginModel, UserSignupModel, UserLoginFaceModel, UserSignupFaceModel
from .utils import create_access_token
from passlib.context import CryptContext
from datetime import timedelta
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from fastapi import status
from typing import List
from bson import ObjectId
# FACEID
from scipy.spatial.distance import cosine
import numpy as np

REFRESH_TOKEN_EXPIRY = 2
FACEID_THRESHOLD = 0.5
pwd_context = CryptContext(schemes=["bcrypt"])

class LoginService: 
    async def login(self, userdata: UserLoginModel, db) -> JSONResponse:
        try: 
            # Find user by email in the "USERS" collection
            user = await db["USERS"].find_one({"email": userdata.email})
            
            if not user: 
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Wrong email"
                )
            
            if not pwd_context.verify(userdata.password, user["password"]):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Wrong password"
                )
            
            # Use MongoDB's _id as user_id
            user_id = str(user["_id"])
            access_token = create_access_token(
                user_data={'user_id': user_id,'username': user.get("name", "")}
            )
            refresh_token = create_access_token(
                user_data={'user_id': user_id},
                refresh=True,
                expiry=timedelta(days=REFRESH_TOKEN_EXPIRY)
            )
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": "Log in successful",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user": {
                        'user_id': user_id,
                        'username': user.get("name", "")
                    }
                }
            )
        except HTTPException as e:
            raise e
        except Exception as e: 
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    async def loginface(self, userdata: UserLoginFaceModel, db) -> JSONResponse:
        try:
            user = await db["USERS"].find_one({"email": userdata.email})
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid email"
                )
            
            stored_faceid = user.get("faceID")
            if not stored_faceid:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="FaceID not registered for this user"
                )
            
            try:
                stored_faceid_array = np.array(stored_faceid)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Invalid FaceID format in database"
                )
            
            try:
                input_faceid_array = np.array(userdata.faceID) 
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid FaceID format in request"
                )

            # print("input_faceid_array", userdata)
            # print("stored_faceid_array", stored_faceid_array)
            similarity = 1 - cosine(input_faceid_array.flatten(), stored_faceid_array.flatten())
            
            if similarity < FACEID_THRESHOLD:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="FaceID does not match"
                )
            user_id = str(user["_id"])
            access_token = create_access_token(
                user_data={'user_id': user_id,'username': user.get("name", "")}
            )
            refresh_token = create_access_token(
                {'user_id': user_id,}, 
                refresh=True, 
                expiry=timedelta(days=REFRESH_TOKEN_EXPIRY)
            )
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": "Login successful",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user": {
                        'user_id': user_id,
                        'username': user.get("name", "")
                    }
                }
            )
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Internal server error: {str(e)}"
            )
    async def create_new_user(self, user_data: UserSignupModel, db):
        existing_user = await db["USERS"].find_one({"email": user_data.email})
        if existing_user: 
            raise HTTPException(status_code=403, detail="Email already exists")
        
        hashed_password = pwd_context.hash(user_data.password)
        new_user = {
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password
        }
        
        result = await db["USERS"].insert_one(new_user)
        if not result.inserted_id:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User creation failed")
        
        return await self.login(UserLoginModel(email=user_data.email, password=user_data.password), db)

 
    async def create_faceID(self, userData: UserSignupFaceModel, db):
        try:
            user = await db["USERS"].find_one({"email": userData.email})
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User not found"
                )

            user_id = str(user["_id"])

            faceID_array = userData.faceID
            # print("faceID_array", faceID_array)
            # print("user_id", user_id)
            # print('database', db["USERS"])
            result = await db["USERS"].update_one(
                {"_id": ObjectId(user_id)}, 
                {"$set": {"faceID": faceID_array}}
            )
            # print("result", result)
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Failed to update user"
                )

            return {
                "status_code": status.HTTP_200_OK,
                "message": "Face ID created successfully"
            }

        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Internal server error: {str(e)}"
            )