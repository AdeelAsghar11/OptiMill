import math
from typing import List, Dict, Any

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r

def ring_based_expansion(user_lat: float, user_lon: float, shops: List[Dict[str, Any]], min_results: int = 5) -> List[Dict[str, Any]]:
    """
    Expand search rings until min_results found:
    Ring 1: 5km, Ring 2: 15km, Ring 3: 50km, Ring 4: 100km, Ring 5: 250km
    """
    rings = [5, 15, 50, 100, 250, 1000, 5000] # Added larger rings for global coverage if needed
    
    # Calculate distance for each shop
    for shop in shops:
        if shop.get("latitude") and shop.get("longitude"):
            shop["distance_km"] = haversine_distance(
                user_lat, user_lon, 
                float(shop["latitude"]), float(shop["longitude"])
            )
        else:
            shop["distance_km"] = float('inf')

    # Sort shops by distance
    sorted_shops = sorted(shops, key=lambda x: x["distance_km"])
    
    results = []
    current_ring_index = 0
    
    while len(results) < min_results and current_ring_index < len(rings):
        current_radius = rings[current_ring_index]
        # Get shops within current radius that aren't already in results
        current_results = [s for s in sorted_shops if s["distance_km"] <= current_radius]
        results = current_results
        
        # Track which ring they fell into
        for s in results:
            if "ring_km" not in s:
                s["ring_km"] = current_radius
                
        current_ring_index += 1
        
    return sorted_shops # Return all shops but they have distance and ring info
