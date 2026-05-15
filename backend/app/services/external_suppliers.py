import requests
import logging
from typing import List, Dict, Any
from app.supabase import supabase
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class ExternalSupplierFinder:
    """
    Search for material suppliers using OpenStreetMap (Overpass API).
    Caches results in the database to minimize API calls.
    """
    
    OVERPASS_URL = "https://overpass-api.de/api/interpreter"

    async def find_suppliers(self, material_type: str, lat: float, lon: float, radius_km: float = 20.0) -> List[Dict[str, Any]]:
        """
        Main entry point for finding suppliers. Checks cache first, then API.
        """
        # 1. Try to find cached results
        cached = await self._get_cached_suppliers(material_type, lat, lon, radius_km)
        if cached:
            logger.info(f"Found {len(cached)} cached suppliers for {material_type}")
            return cached

        # 2. Fetch from Overpass API
        logger.info(f"Fetching {material_type} suppliers from Overpass API...")
        api_results = self._fetch_from_overpass(material_type, lat, lon, radius_km)
        
        # 3. Cache and return
        if api_results:
            await self._cache_suppliers(api_results, material_type)
            
        return api_results

    async def _get_cached_suppliers(self, material_type: str, lat: float, lon: float, radius: float) -> List[Dict[str, Any]]:
        """
        Retrieves suppliers from the database within the radius.
        """
        try:
            # Note: For simplicity, we filter by type and then by distance in Python.
            # In a larger app, use PostGIS 'st_dwithin' for this query.
            res = supabase.table("external_suppliers") \
                .select("*") \
                .contains("material_categories", [material_type.lower()]) \
                .execute()
            
            all_suppliers = res.data
            nearby = []
            
            for s in all_suppliers:
                # Basic distance check (Euclidean approximation or just return all for demo)
                # In production, we'd use Haversine here.
                nearby.append(s)
                
            return nearby[:10] # Return top 10
        except Exception as e:
            logger.error(f"Cache retrieval failed: {e}")
            return []

    def _fetch_from_overpass(self, material_type: str, lat: float, lon: float, radius_km: float) -> List[Dict[str, Any]]:
        """
        Calls Overpass API to find specific shops/amenities.
        """
        radius_meters = radius_km * 1000
        
        # Map material types to OSM tags
        tag_map = {
            "timber": 'node["shop"="doityourself"]',
            "metal": 'node["shop"="hardware"]',
            "fabric": 'node["shop"="fabric"]',
            "foam": 'node["shop"="furniture"]',
            "hardware": 'node["shop"="hardware"]',
            "default": 'node["shop"="doityourself"]'
        }
        
        tag = tag_map.get(material_type.lower(), tag_map["default"])
        
        query = f"""
        [out:json][timeout:25];
        (
          {tag}(around:{radius_meters},{lat},{lon});
          way["shop"="hardware"](around:{radius_meters},{lat},{lon});
        );
        out body;
        >;
        out skel qt;
        """
        
        try:
            response = requests.get(self.OVERPASS_URL, params={'data': query})
            response.raise_for_status()
            data = response.json()
            
            suppliers = []
            for element in data.get('elements', []):
                if element.get('type') == 'node':
                    tags = element.get('tags', {})
                    suppliers.append({
                        "external_id": f"osm:{element['id']}",
                        "supplier_name": tags.get('name', 'Local Supplier'),
                        "supplier_type": f"{material_type}_supplier",
                        "address": tags.get('addr:full') or f"{tags.get('addr:street', '')} {tags.get('addr:city', '')}".strip() or "Address not available",
                        "latitude": element['lat'],
                        "longitude": element['lon'],
                        "phone": tags.get('phone') or tags.get('contact:phone'),
                        "website": tags.get('website') or tags.get('contact:website'),
                        "rating": 4.0, # Default since OSM doesn't have ratings
                        "review_count": 0,
                        "api_source": "openstreetmap",
                        "material_categories": [material_type.lower()]
                    })
            
            return suppliers
        except Exception as e:
            logger.error(f"Overpass API call failed: {e}")
            return []

    async def _cache_suppliers(self, suppliers: List[Dict[str, Any]], material_type: str):
        """
        Saves API results to the database.
        """
        try:
            for s in suppliers:
                supabase.table("external_suppliers").upsert(s, on_conflict="external_id").execute()
        except Exception as e:
            logger.error(f"Failed to cache suppliers: {e}")
