from app.supabase import supabase
import uuid

def seed_shops():
    shops = [
        {
            "name": "Apex 3D Innovations",
            "description": "High-end 3D printing and advanced composite materials.",
            "address": "400 Silicon Ridge, Austin, TX",
            "capabilities": ["3D Printing (FDM)", "3D Printing (SLA)"],
            "materials": ["PETG", "Carbon Fiber", "Resin", "PLA"],
            "hourly_rate": 55.0,
            "min_order": 100.0,
            "turnaround_days": 4,
            "rating": 4.7,
            "location_city": "Austin",
            "location_country": "USA",
            "is_active": True
        },
        {
            "name": "Titan Forge Manufacturing",
            "description": "Industrial grade CNC machining and sheet metal forming.",
            "address": "808 Industrial Blvd, Seattle, WA",
            "capabilities": ["CNC Milling", "Sheet Metal", "Welding"],
            "materials": ["Titanium", "Steel", "Stainless Steel", "Aluminum"],
            "hourly_rate": 110.0,
            "min_order": 800.0,
            "turnaround_days": 12,
            "rating": 4.9,
            "location_city": "Seattle",
            "location_country": "USA",
            "is_active": True
        },
        {
            "name": "Polymer Tech Solutions",
            "description": "Specialists in injection molding and high-volume plastics.",
            "address": "220 Manufacturing Row, Chicago, IL",
            "capabilities": ["Injection Molding", "3D Printing (FDM)"],
            "materials": ["ABS", "Nylon", "Polycarbonate"],
            "hourly_rate": 80.0,
            "min_order": 1500.0,
            "turnaround_days": 21,
            "rating": 4.4,
            "location_city": "Chicago",
            "location_country": "USA",
            "is_active": True
        },
        {
            "name": "Lumina Laser Works",
            "description": "Precision laser cutting and fine engraving services.",
            "address": "330 Ocean Drive, Miami, FL",
            "capabilities": ["Laser Cutting"],
            "materials": ["Acrylic", "Wood", "Glass", "Leather"],
            "hourly_rate": 40.0,
            "min_order": 75.0,
            "turnaround_days": 2,
            "rating": 4.6,
            "location_city": "Miami",
            "location_country": "USA",
            "is_active": True
        },
        {
            "name": "MicroMachining Pros",
            "description": "Micro-precision milling and Swiss turning for medical parts.",
            "address": "90 Innovation Way, Boston, MA",
            "capabilities": ["CNC Milling", "Turning"],
            "materials": ["Brass", "Copper", "Aluminum", "Steel"],
            "hourly_rate": 150.0,
            "min_order": 2000.0,
            "turnaround_days": 18,
            "rating": 4.9,
            "location_city": "Boston",
            "location_country": "USA",
            "is_active": True
        },
        {
            "name": "EcoBuild Sustainable Fab",
            "description": "Eco-friendly fabrication using sustainable and recycled materials.",
            "address": "500 Green Ave, Denver, CO",
            "capabilities": ["CNC Milling", "3D Printing (FDM)", "Laser Cutting"],
            "materials": ["Recycled PLA", "Bamboo", "Cork", "Wood"],
            "hourly_rate": 60.0,
            "min_order": 150.0,
            "turnaround_days": 7,
            "rating": 4.8,
            "location_city": "Denver",
            "location_country": "USA",
            "is_active": True
        }
    ]

    print("Seeding shops...")
    for shop in shops:
        try:
            res = supabase.table("shops").insert(shop).execute()
            print(f"Inserted: {shop['name']}")
        except Exception as e:
            print(f"Failed to insert {shop['name']}: {e}")

if __name__ == "__main__":
    seed_shops()
