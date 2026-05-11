import json
import random
import os

def generate_realistic_machine_rates(count=50):
    machines = []
    
    # Categories based on industrial benchmarks
    categories = [
        {"type": "Standard Industrial", "precision_range": (0.8, 1.5), "rate_range": (12.0, 20.0), "materials": ["Cotton", "Polyester"]},
        {"type": "Heavy Duty Stitcher", "precision_range": (0.4, 0.7), "rate_range": (21.0, 30.0), "materials": ["Denim", "Canvas", "Leather"]},
        {"type": "Precision Embroidery", "precision_range": (0.1, 0.3), "rate_range": (31.0, 40.0), "materials": ["Silk", "Satin", "Fine-Cotton"]},
        {"type": "Ultra-Finishing", "precision_range": (0.05, 0.1), "rate_range": (41.0, 45.0), "materials": ["Silk", "Satin", "Tech-Fabrics"]}
    ]

    for i in range(count):
        cat = random.choice(categories)
        
        # Determine age (1-15 years)
        age = random.randint(1, 15)
        
        # Calculate Total Rate within category bounds
        total_rate = round(random.uniform(cat["rate_range"][0], cat["rate_range"][1]), 2)
        
        # Apply Precision Premium Rule (M2 Rule 2)
        precision = round(random.uniform(cat["precision_range"][0], cat["precision_range"][1]), 2)
        if precision < 0.2 and total_rate < 35.0:
            total_rate = round(random.uniform(35.0, 45.0), 2)
            
        # Distribute rate according to Labor Weight Rule (M2 Rule 3)
        # operator_wage_hr (40-60%)
        wage_pct = random.uniform(0.45, 0.55)
        operator_wage = round(total_rate * wage_pct, 2)
        
        # Remaining overhead
        remaining = total_rate - operator_wage
        energy = round(remaining * 0.2, 2)
        maintenance = round(remaining * 0.3, 2)
        depreciation = round(total_rate - operator_wage - energy - maintenance, 2)
        
        # Calculate Defect Rate (Age Correlation Rule - M2 Rule 1)
        base_defect = 0.005 # 0.5%
        defect_rate = round(base_defect + (age * 0.0025), 4)
        
        machines.append({
            "machine_id": f"MCN-{cat['type'][:3].upper()}-{100+i}",
            "type": cat["type"],
            "operator_wage_hr": operator_wage,
            "overhead_energy_hr": energy,
            "maintenance_cost_hr": maintenance,
            "depreciation_hr": depreciation,
            "total_hourly_rate": total_rate,
            "precision_mm": precision,
            "age_years": age,
            "defect_rate_base": defect_rate,
            "material_compat": cat["materials"],
            "daily_capacity": random.randint(50, 800)
        })
        
    return machines

if __name__ == "__main__":
    data = generate_realistic_machine_rates(50)
    
    # Ensure directory exists
    os.makedirs("data", exist_ok=True)
    
    with open("data/machine_rates.json", "w") as f:
        json.dump(data, f, indent=2)
        
    print(f"Successfully generated 50 production-grade machine records in data/machine_rates.json")
    print(f"Rate Bounds: ${min(m['total_hourly_rate'] for m in data)} - ${max(m['total_hourly_rate'] for m in data)}")
