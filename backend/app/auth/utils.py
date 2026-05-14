from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from app.supabase import supabase
from app.core.config import settings
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)

# ── Dev bypass ────────────────────────────────────────────────────────────────
# In development, pass the header  X-Dev-User-Id: <any-uuid>  to skip real auth.
# This is NEVER active when ENV != "development".
DEV_MOCK_USER_TEMPLATE = {
    "id": "",            # filled from header
    "email": "dev@optimill.local",
    "full_name": "Dev User",
    "role": "client",
    "avatar_url": None,
}

def _get_dev_user(request: Request) -> dict | None:
    if settings.ENV != "development":
        return None
    dev_id = request.headers.get("X-Dev-User-Id")
    if not dev_id:
        return None
    try:
        uuid.UUID(dev_id)   # validate it's a real UUID
    except ValueError:
        return None
    user = DEV_MOCK_USER_TEMPLATE.copy()
    user["id"] = dev_id
    return user


# ── Main dependency ────────────────────────────────────────────────────────────
async def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
):
    """
    Validates the Supabase JWT and returns the user metadata.

    Dev shortcut (ENV=development only):
        Pass header  X-Dev-User-Id: <uuid>  — no token required.
    """
    # 1. Check dev bypass first
    dev_user = _get_dev_user(request)
    if dev_user:
        return dev_user

    # 2. Normal token validation
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        res = supabase.auth.get_user(token)
        if not res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_profile = (
            supabase.table("profiles")
            .select("*")
            .eq("id", res.user.id)
            .single()
            .execute()
        )
        if not user_profile.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )
        return user_profile.data

    except HTTPException:
        raise
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
                detail="You do not have enough permissions to access this resource",
            )
        return current_user
    return role_checker
