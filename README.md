# OptiMill: Rule-Based Manufacturing Orchestration

OptiMill is a high-precision manufacturing orchestration system designed to streamline the production pipeline through deterministic rule-based risk analysis and capacity matching.

## The "Golden Path" Demo
1. **Submit**: Input fabric specifications and order requirements.
2. **Analyze**: The **Rule-Based Quality Risk Scoring Engine** evaluates potential defects.
3. **Match**: Find the most efficient production line based on real-world capacity data.
4. **Quote**: Generate a detailed cost breakdown including quality premiums.
5. **Schedule**: Produce a realistic manufacturing timeline with built-in risk buffers.

## 4-Member Team Division
- **Member 1 (Lead)**: Engine Architect (Risk Scoring, Matching Algorithms)
- **Member 2**: Data Specialist (Seed Data, Financial Quoting, Data Integrity)
- **Member 3**: Frontend Lead (Interactive Dashboards, Pipeline Visualization)
- **Member 4**: DevOps/Integration (Git Workflow, Testing, Pipeline Hookup)

## Tech Stack
- **Backend**: Python (FastAPI)
- **Frontend**: Vite / React (Planned)
- **Database**: PostgreSQL (Planned)

## Setup (Local Development)
### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn app.main:app --reload`

---
*Note: This project strictly avoids "black box" AI. All logic is auditable and rule-based.*
