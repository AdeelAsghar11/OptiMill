from app.supabase import supabase
import random

def seed_shops():
    shops = [
        {
            "name": "Apex 3D Innovations",
            "description": "High-end industrial 3D printing, rapid prototyping, and advanced composite materials.",
            "address": "400 Silicon Ridge, Austin, TX",
            "capabilities": ["3D Printing (FDM)", "3D Printing (SLA)"],
            "materials": ["PLA", "ABS", "PETG", "Resin", "Carbon Fiber"],
            "hourly_rate": 55.0,
            "min_order": 100.0,
            "turnaround_days": 4,
            "rating": 4.7,
            "lat": 34.0522,
            "lng": -118.2437,
            "verified": True,
            "is_active": True
        },
        {
            "name": "Titan Forge Manufacturing",
            "description": "Heavy-duty industrial grade CNC machining, sheet metal forming, and high-strength welding.",
            "address": "808 Industrial Blvd, Seattle, WA",
            "capabilities": ["CNC Milling", "Sheet Metal", "Welding"],
            "materials": ["Steel", "Stainless Steel", "Aluminum", "Titanium"],
            "hourly_rate": 110.0,
            "min_order": 800.0,
            "turnaround_days": 12,
            "rating": 4.9,
            "lat": 34.0822,
            "lng": -118.3437,
            "verified": True,
            "is_active": True
        },
        {
            "name": "Polymer Tech Solutions",
            "description": "Specialists in custom injection molding, tooling development, and high-volume plastics.",
            "address": "220 Manufacturing Row, Chicago, IL",
            "capabilities": ["Injection Molding"],
            "materials": ["ABS", "Polycarbonate", "PLA"],
            "hourly_rate": 80.0,
            "min_order": 1500.0,
            "turnaround_days": 21,
            "rating": 4.4,
            "lat": 33.9522,
            "lng": -118.1437,
            "verified": False,
            "is_active": True
        },
        {
            "name": "Lumina Laser Works",
            "description": "High-precision laser cutting and fine engraving services for non-metals.",
            "address": "330 Ocean Drive, Miami, FL",
            "capabilities": ["Laser Cutting"],
            "materials": ["Acrylic", "Carbon Fiber", "Resin"],
            "hourly_rate": 40.0,
            "min_order": 75.0,
            "turnaround_days": 2,
            "rating": 4.6,
            "lat": 34.1522,
            "lng": -118.4437,
            "verified": True,
            "is_active": True
        },
        {
            "name": "MicroMachining Pros",
            "description": "Ultra-precision CNC milling and Swiss turning for medical and aerospace parts.",
            "address": "90 Innovation Way, Boston, MA",
            "capabilities": ["CNC Milling"],
            "materials": ["Steel", "Aluminum", "Titanium"],
            "hourly_rate": 150.0,
            "min_order": 2000.0,
            "turnaround_days": 18,
            "rating": 4.9,
            "lat": 34.0122,
            "lng": -118.2837,
            "verified": True,
            "is_active": True
        },
        {
            "name": "EcoBuild Sustainable Fab",
            "description": "Eco-friendly fabrication using bio-plastics and sustainable composite materials.",
            "address": "500 Green Ave, Denver, CO",
            "capabilities": ["CNC Milling", "3D Printing (FDM)", "Laser Cutting"],
            "materials": ["PLA", "Carbon Fiber"],
            "hourly_rate": 60.0,
            "min_order": 150.0,
            "turnaround_days": 7,
            "rating": 4.8,
            "lat": 34.1122,
            "lng": -118.1837,
            "verified": True,
            "is_active": True
        },
        {
            "name": "Pacific Crest Machining",
            "description": "Aerospace-grade CNC milling, tight tolerances, and carbon fiber structural components.",
            "address": "50 Mission St, San Francisco, CA",
            "capabilities": ["CNC Milling"],
            "materials": ["Aluminum", "Titanium", "Carbon Fiber"],
            "hourly_rate": 125.0,
            "min_order": 500.0,
            "turnaround_days": 10,
            "rating": 4.8,
            "lat": 34.0622,
            "lng": -118.3037,
            "verified": True,
            "is_active": True
        },
        {
            "name": "Quantum Additive Mfg",
            "description": "High-fidelity SLA 3D printing for functional prototypes and jewelers.",
            "address": "15 Wall St, New York, NY",
            "capabilities": ["3D Printing (SLA)"],
            "materials": ["Resin"],
            "hourly_rate": 65.0,
            "min_order": 120.0,
            "turnaround_days": 3,
            "rating": 4.5,
            "lat": 34.0322,
            "lng": -118.2137,
            "verified": False,
            "is_active": True
        },
        {
            "name": "Delta Fabrication Group",
            "description": "Custom steel structures, general sheet metal operations, and professional welding.",
            "address": "1200 Texas Ave, Houston, TX",
            "capabilities": ["Welding", "Sheet Metal"],
            "materials": ["Steel", "Stainless Steel", "Aluminum"],
            "hourly_rate": 90.0,
            "min_order": 350.0,
            "turnaround_days": 8,
            "rating": 4.6,
            "lat": 33.9822,
            "lng": -118.3837,
            "verified": True,
            "is_active": True
        },
        {
            "name": "AeroMetal Components",
            "description": "High-velocity CNC turning and titanium milling for defense contractors.",
            "address": "555 Flower St, Los Angeles, CA",
            "capabilities": ["CNC Milling"],
            "materials": ["Titanium", "Aluminum", "Steel"],
            "hourly_rate": 140.0,
            "min_order": 1200.0,
            "turnaround_days": 14,
            "rating": 4.9,
            "lat": 34.1322,
            "lng": -118.2637,
            "verified": True,
            "is_active": True
        },
        {
            "name": "Summit Rapid Prototyping",
            "description": "Instant prototype fabrication with state-of-the-art SLA and FDM 3D printers.",
            "address": "100 Temple Sq, Salt Lake City, UT",
            "capabilities": ["3D Printing (FDM)", "3D Printing (SLA)"],
            "materials": ["PLA", "PETG", "ABS", "Resin"],
            "hourly_rate": 45.0,
            "min_order": 50.0,
            "turnaround_days": 2,
            "rating": 4.7,
            "lat": 34.0722,
            "lng": -118.2537,
            "verified": True,
            "is_active": True
        },
        {
            "name": "Gulf Coast Welding & Assembly",
            "description": "Heavy marine welding, structural steel assembly, and non-destructive testing.",
            "address": "400 Canal St, New Orleans, LA",
            "capabilities": ["Welding"],
            "materials": ["Steel", "Stainless Steel"],
            "hourly_rate": 95.0,
            "min_order": 400.0,
            "turnaround_days": 9,
            "rating": 4.5,
            "lat": 33.9122,
            "lng": -118.4237,
            "verified": False,
            "is_active": True
        },
        {
            "name": "Rapid Tooling Solutions",
            "description": "Fast turn injection molds and low-volume production plastics.",
            "address": "900 Woodward Ave, Detroit, MI",
            "capabilities": ["Injection Molding"],
            "materials": ["Polycarbonate", "ABS"],
            "hourly_rate": 85.0,
            "min_order": 1000.0,
            "turnaround_days": 15,
            "rating": 4.3,
            "lat": 34.1822,
            "lng": -118.3137,
            "verified": False,
            "is_active": True
        },
        {
            "name": "Horizon Sheet Metal",
            "description": "Precision metal panels, high-velocity laser cutting, and bending.",
            "address": "120 Central Ave, Phoenix, AZ",
            "capabilities": ["Sheet Metal", "Laser Cutting"],
            "materials": ["Aluminum", "Steel"],
            "hourly_rate": 75.0,
            "min_order": 200.0,
            "turnaround_days": 5,
            "rating": 4.6,
            "lat": 34.0222,
            "lng": -118.4937,
            "verified": True,
            "is_active": True
        },
        {
            "name": "Genesis Biotech Machining",
            "description": "Medical implant manufacturing and clean-room microscopic CNC operations.",
            "address": "101 Broadway, San Diego, CA",
            "capabilities": ["CNC Milling"],
            "materials": ["Titanium", "Stainless Steel"],
            "hourly_rate": 160.0,
            "min_order": 2500.0,
            "turnaround_days": 20,
            "rating": 4.9,
            "lat": 33.8922,
            "lng": -118.2237,
            "verified": True,
            "is_active": True
        }
    ]

    print(f"Seeding {len(shops)} high-fidelity shops...")
    for shop in shops:
        try:
            # Check if shop already exists to prevent duplicate seeding
            existing = supabase.table("shops").select("id").eq("name", shop["name"]).execute()
            if existing.data:
                print(f"Shop '{shop['name']}' already exists. Skipping.")
                continue
                
            res = supabase.table("shops").insert(shop).execute()
            print(f"Inserted: {shop['name']}")
        except Exception as e:
            print(f"Failed to insert {shop['name']}: {e}")

if __name__ == "__main__":
    seed_shops()
