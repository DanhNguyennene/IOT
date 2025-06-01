from pydantic import BaseModel, Field
from typing import List

class UserLoginModel(BaseModel):
    email: str = Field(max_length=40)
    password: str = Field(min_length=6)
class UserLoginFaceModel(BaseModel):
    email: str = Field(max_length=40)
    # password: str = Field(min_length=6)
    faceID: List[float] = []

class UserSignupModel(BaseModel):
    name: str = Field(max_length=100)
    email: str = Field(max_length=40)
    password: str = Field(min_length=6)
class UserSignupFaceModel(BaseModel):
    email: str = Field(max_length=40)
    password: str = Field(min_length=6)
    faceID: List[float] = []
