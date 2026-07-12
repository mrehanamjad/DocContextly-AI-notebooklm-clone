from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID

class UserCreateReq(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLoginReq(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime

    # class Config:
    #     orm_mode = True

    # Pydantic V2 standard for ORM mapping
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    email: str



