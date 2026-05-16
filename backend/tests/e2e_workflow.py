import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = "http://localhost:8000/api/v1"
TEST_USER_EMAIL = os.getenv("TEST_USER_EMAIL")
TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD")

async def run_e2e_test():
    async with httpx.AsyncClient() as client:
        print("--- OptiMill E2E Workflow Test ---")
        
        # 1. Login
        print("\n1. Logging in...")
        login_res = await client.post(f"{API_URL}/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if login_res.status_code != 200:
            print(f"Login failed: {login_res.text}")
            return
        
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful.")

        # 2. Upload CAD (using a small sample STL if possible, or just checking the endpoint)
        print("\n2. Testing CAD Upload & Analysis...")
        # For this test, we assume a file 'test.stl' exists in the current dir
        if os.path.exists("test.stl"):
            files = {'file': ('test.stl', open('test.stl', 'rb'), 'application/sla')}
            upload_res = await client.post(f"{API_URL}/cad/upload", headers=headers, files=files)
            if upload_res.status_code == 200:
                cad_data = upload_res.json()
                print(f"Upload success! CAD ID: {cad_data['id']}")
                cad_id = cad_data['id']
            else:
                print(f"Upload failed: {upload_res.text}")
                return
        else:
            print("Skipping actual upload (test.stl not found). Using dummy ID if exists or listing.")
            list_res = await client.get(f"{API_URL}/cad/", headers=headers)
            if list_res.status_code == 200 and list_res.json():
                cad_id = list_res.json()[0]['id']
                print(f"Using existing CAD ID: {cad_id}")
            else:
                print("No CAD files found to test.")
                return

        # 3. Get Recommendations
        print("\n3. Testing Recommendations...")
        rec_res = await client.get(f"{API_URL}/cad/{cad_id}/recommendations", headers=headers)
        if rec_res.status_code == 200:
            recs = rec_res.json()
            print(f"Found {len(recs)} recommended shops.")
            if recs:
                print(f"Top match: {recs[0]['name']} (Score: {recs[0]['match_score']})")
        else:
            print(f"Recommendations failed: {rec_res.text}")

        # 4. Get Materials
        print("\n4. Testing Material Inference...")
        mat_res = await client.get(f"{API_URL}/cad/{cad_id}/materials", headers=headers)
        if mat_res.status_code == 200:
            mats = mat_res.json()
            print(f"Inferred materials: {list(mats.keys())}")
        else:
            print(f"Material inference failed: {mat_res.text}")

        print("\n--- E2E Test Completed ---")

if __name__ == "__main__":
    if not TEST_USER_EMAIL or not TEST_USER_PASSWORD:
        print("Please set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env")
    else:
        asyncio.run(run_e2e_test())
