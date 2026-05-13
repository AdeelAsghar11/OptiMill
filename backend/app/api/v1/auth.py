from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.supabase import supabase
from app.auth.utils import get_current_user
from typing import Optional

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register(user_data: UserRegister):
    # 1. Sign up user in Supabase Auth
    # The 'profiles' table will be auto-populated by a DB trigger
    try:
        auth_res = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.name,
                    "role": user_data.role
                }
            }
        })
        
        if not auth_res.user:
            raise HTTPException(status_code=400, detail="Registration failed")

        return {"message": "User registered successfully. Please check your email for verification.", "user": auth_res.user}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(credentials: UserLogin):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {
            "access_token": res.session.access_token,
            "token_type": "bearer",
            "expires_in": res.session.expires_in
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
