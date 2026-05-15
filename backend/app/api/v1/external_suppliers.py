from fastapi import APIRouter, Depends, HTTPException
from app.auth.utils import get_current_user
from app.services.external_suppliers import ExternalSupplierFinder
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class SupplierSearchRequest(BaseModel):
    material_type: str
    latitude: float
    longitude: float
    radius_km: Optional[float] = 20.0

@router.post("/search")
async def search_external_suppliers(
    request: SupplierSearchRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Search for external material suppliers near the user.
    """
    try:
        finder = ExternalSupplierFinder()
        results = await finder.find_suppliers(
            material_type=request.material_type,
            lat=request.latitude,
            lon=request.longitude,
            radius_km=request.radius_km
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
