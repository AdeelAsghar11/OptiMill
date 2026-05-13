from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.supabase import supabase
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Validates the Supabase JWT and returns the user metadata.
    """
    try:
        # Verify the token with Supabase
        res = supabase.auth.get_user(token)
        if not res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get additional user info from our 'profiles' table
        user_profile = supabase.table("profiles").select("*").eq("id", res.user.id).single().execute()
        
        if not user_profile.data:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )
            
        return user_profile.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_role(allowed_roles: list[str]):
    """
    Dependency to enforce role-based access control.
    """
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions to access this resource"
            )
        return current_user
    return role_checker
