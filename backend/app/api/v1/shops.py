from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user, require_role
from pydantic import BaseModel
from typing import List, Optional
from app.utils.geospatial import haversine_distance, ring_based_expansion

router = APIRouter()

# --- Schemas ---
class ShopCreate(BaseModel):
    name: str
    description: Optional[str] = None
    location_city: Optional[str] = None
    location_country: Optional[str] = None
    hourly_rate: Optional[float] = None
    capabilities: List[str] = []
    materials: List[str] = []
    machines: Optional[list] = []

class ReviewCreate(BaseModel):
    shop_id: str
    order_id: str
    rating: int  # 1-5
    comment: Optional[str] = None


# --- t14: Create / Update Shop Profile ---
@router.post("/")
async def create_shop(shop_data: ShopCreate, current_user: dict = Depends(require_role(["shop", "admin"]))):
    """Shop Master creates or updates their shop profile."""
    try:
        # Upsert shop linked to the current user's profile
        res = supabase.table("shops").upsert({
            "owner_id": current_user["id"],
            "name": shop_data.name,
            "description": shop_data.description,
            "location_city": shop_data.location_city,
            "location_country": shop_data.location_country,
            "hourly_rate": shop_data.hourly_rate,
            "capabilities": shop_data.capabilities,
            "materials": shop_data.materials,
            "machines": shop_data.machines,
            "is_verified": False,
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- t15: Shop Discovery with Filtering ---
@router.get("/discover")
async def discover_shops(
    capability: Optional[str] = None,
    material: Optional[str] = None,
    city: Optional[str] = None,
    min_rating: Optional[float] = None,
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lon: Optional[float] = None,
):
    """Discover shops filtered by capability, material, city, or rating."""
    try:
        query = supabase.table("shops").select(
            "id, name, description, location_city, location_country, capabilities, materials, hourly_rate, rating, is_verified, latitude, longitude"
        )

        if city:
            query = query.ilike("location_city", f"%{city}%")
        if min_rating:
            query = query.gte("rating", min_rating)
        if capability:
            query = query.contains("capabilities", [capability])
        if material:
            query = query.contains("materials", [material])
        if min_lat is not None and max_lat is not None:
            query = query.gte("latitude", min_lat).lte("latitude", max_lat)
        if min_lon is not None and max_lon is not None:
            query = query.gte("longitude", min_lon).lte("longitude", max_lon)

        res = query.execute()
        shops = res.data
        
        # Add mock lat/lon if missing for map demo
        import random
        for s in shops:
            if not s.get("latitude"):
                s["latitude"] = 34.05 + (random.random() - 0.5) * 0.1 # Mock near LA
                s["longitude"] = -118.24 + (random.random() - 0.5) * 0.1
                
        return shops
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- t54: Nearby Shops (Radius Based) ---
@router.get("/nearby")
async def get_nearby_shops(
    lat: float,
    lon: float,
    radius: float = 10.0, # km
):
    """Get shops within a specific radius using Haversine distance."""
    try:
        # For a production app with millions of shops, use PostGIS 'location' column
        # For now, we'll fetch all shops and filter in memory since the shop count is low
        res = supabase.table("shops").select("*").execute()
        shops = res.data
        
        nearby_shops = []
        for shop in shops:
            if shop.get("latitude") and shop.get("longitude"):
                dist = haversine_distance(lat, lon, float(shop["latitude"]), float(shop["longitude"]))
                if dist <= radius:
                    shop["distance_km"] = round(dist, 2)
                    nearby_shops.append(shop)
        
        # Sort by distance
        nearby_shops.sort(key=lambda x: x["distance_km"])
        return nearby_shops
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- t55: Ring-Based Expansion Search ---
@router.get("/nearby-expanded")
async def get_nearby_expanded(
    lat: float,
    lon: float,
    min_results: int = 5
):
    """Get shops using ring-based expansion (5km, 15km, 50km, etc.)."""
    try:
        res = supabase.table("shops").select("*").execute()
        shops = res.data
        
        # Use our utility to calculate rings and distance
        # Note: In a real app, this would be a more complex SQL query or multiple queries
        processed_shops = ring_based_expansion(lat, lon, shops, min_results)
        
        # Filter to return only those that fall within the expansion logic (or all if requested)
        # For now, we return all sorted by distance with ring info
        return processed_shops
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- t16: Public Shop Profile ---
@router.get("/{shop_id}")
async def get_shop_profile(shop_id: str):
    """Get full public shop profile with machines and portfolio."""
    try:
        shop_res = supabase.table("shops").select("*").eq("id", shop_id).single().execute()
        reviews_res = supabase.table("reviews").select("*, profiles!inner(full_name)").eq("shop_id", shop_id).execute()
        return {
            "shop": shop_res.data,
            "reviews": reviews_res.data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- t17: Submit a Review ---
@router.post("/reviews")
async def submit_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    """Client submits a review for a shop after an order is complete."""
    try:
        if not 1 <= review.rating <= 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")

        # Insert review
        review_res = supabase.table("reviews").insert({
            "shop_id": review.shop_id,
            "client_id": current_user["id"],
            "order_id": review.order_id,
            "rating": review.rating,
            "comment": review.comment,
        }).execute()

        # Recalculate and update shop average rating
        all_reviews = supabase.table("reviews").select("rating").eq("shop_id", review.shop_id).execute()
        ratings = [r["rating"] for r in all_reviews.data]
        avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else review.rating

        supabase.table("shops").update({"rating": avg_rating}).eq("id", review.shop_id).execute()

        return review_res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
