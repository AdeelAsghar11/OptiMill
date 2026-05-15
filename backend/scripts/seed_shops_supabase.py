from app.supabase import supabase
import uuid

def seed_shops():
    shops = [
        {
            "name": "Precision CNC Works",
            "description": "Specializing in high-precision aerospace parts.",
            "address": "123 Industrial Way, Houston, TX",
            "capabilities": ["CNC", "milling", "turning"],
            "materials": ["Aluminum", "Steel", "Titanium"],
            "hourly_rate": 85.0,
            "min_order": 500.0,
            "turnaround_days": 10,
            "rating": 4.8,
            "is_active": True
        },
        {
            "name": "Rapid Prototype Lab",
            "description": "Fast 3D printing and laser cutting for innovators.",
            "address": "456 Tech Park, San Francisco, CA",
            "capabilities": ["3D_FDM", "3D_SLA", "laser_cut"],
            "materials": ["PLA", "Resin", "Acrylic", "Plywood"],
            "hourly_rate": 45.0,
            "min_order": 50.0,
            "turnaround_days": 3,
            "rating": 4.5,
            "is_active": True
        },
        {
            "name": "Heavy Metal Fabricators",
            "description": "Large scale industrial metal fabrication.",
            "address": "789 Foundry St, Detroit, MI",
            "capabilities": ["welding", "laser_cut", "bending"],
            "materials": ["Steel", "Stainless Steel", "Iron"],
            "hourly_rate": 120.0,
            "min_order": 1000.0,
            "turnaround_days": 20,
            "rating": 4.2,
            "is_active": True
        },
        {
            "name": "Furniture Craft Studio",
            "description": "Custom wood and hybrid material furniture manufacturing.",
            "address": "101 Artisan Row, Portland, OR",
            "capabilities": ["CNC", "woodworking", "laser_cut"],
            "materials": ["Timber", "Oak", "Walnut", "Aluminum"],
            "hourly_rate": 65.0,
            "min_order": 200.0,
            "turnaround_days": 14,
            "rating": 4.9,
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
