# DataFlow Academy 🚀

An open, **free** learning platform to master **Apache Airflow, Spark, and Kafka** —
with detailed lessons (easy → advanced), a real in-browser code editor, and
hands-on practice where you build and run projects.

Anyone can open the website, sign up, learn, and build data-engineering projects —
**no installs required**.

---

## ✨ What makes it work (the tradeoff we chose)

Real Airflow/Spark/Kafka are heavy server programs — they can't run in a browser,
and running them per-user in the cloud costs money. So we picked the **free +
no-install** path:

| Skill | How you practice it here | Real? |
|-------|--------------------------|-------|
| **Python / Spark (PySpark, pandas)** | Runs for real in your browser via **Pyodide** | ✅ Actually executes |
| **Airflow** | Write real DAG code → **DAG simulator** animates the task flow | ⚙️ Real code, simulated run |
| **Kafka** | Write real producer/consumer code → **Kafka simulator** streams messages | ⚙️ Real code, simulated run |

> The code you write here is **real syntax** — it runs unchanged on real tools later.

---

## 🏗️ Architecture

```
Render (free)
┌──────────────────────────┐
│  React frontend (Vite)   │  ← lessons + code editor + simulators + project builder
├──────────────────────────┤
│  FastAPI backend         │  ← signup/login, save progress, save projects
├──────────────────────────┤
│  PostgreSQL              │  ← accounts, progress, projects (dynamic storage)
└──────────────────────────┘

In-browser execution: Pyodide (real Python) + DAG/Kafka simulators
```

---

## 📁 Project layout

```
dataeng/
├── frontend/          # React + Vite web app (the platform UI)
│   ├── src/
│   │   ├── pages/         # Home, Course, Lesson, Workspace, Login, Signup, Dashboard
│   │   ├── components/    # Editor, PythonRunner, DagSimulator, KafkaSimulator, ...
│   │   ├── data/          # course.js  (all lesson content lives here)
│   │   ├── context/       # AuthContext (login state)
│   │   └── lib/           # api.js (talks to backend, localStorage fallback)
│   └── package.json
├── backend/           # FastAPI + PostgreSQL (accounts + storage)
│   ├── app/
│   └── requirements.txt
├── render.yaml        # one-file Render deployment blueprint
└── README.md
```

---

## ▶️ Run it locally

### 1. Frontend (the learning app)
```bash
cd frontend
npm install
npm run dev
```
Open the URL it prints (usually http://localhost:5173).

> The frontend works on its own using **localStorage** for accounts/progress —
> so you can try everything before setting up the backend.

### 2. Backend (real accounts + TiDB storage)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate                 # Windows
pip install -r requirements.txt

# Copy .env.example to .env and set your TiDB DATABASE_URL + JWT_SECRET.
# Create an admin account (also creates the tables in TiDB):
python create_admin.py "Admin User" admin@dataflow.com admin123

# Start the API (use 8010 if port 8000 is already taken on your machine):
uvicorn app.main:app --reload --port 8010
```
Then set `VITE_API_URL=http://127.0.0.1:8010` in `frontend/.env` and restart the frontend.

**Notes (verified on this machine):**
- Works on **Python 3.11–3.14**. Password hashing uses `bcrypt` directly (no passlib).
- Our tables are prefixed **`dfa_`** (`dfa_users`, `dfa_progress`, `dfa_projects`, `dfa_announcements`) so they never collide with other tables in your TiDB database.
- The backend needs TLS to TiDB — handled automatically via `certifi` in `app/db.py`.

---

## ☁️ Deploy to Render (free)

1. Push this repo to GitHub.
2. In Render → **New → Blueprint** → point it at this repo.
3. Render reads `render.yaml` and creates: the frontend (static site),
   the backend (web service), and a PostgreSQL database — all on the free tier.

---

## 🗺️ Roadmap

- [x] Finalize architecture (free, no-install, simulators + Pyodide)
- [x] Frontend app shell + routing + theme
- [x] Course content (Foundations, Airflow, Spark, Kafka, Capstone)
- [x] Practice engine (Pyodide + DAG/Kafka simulators)
- [x] Backend (FastAPI + TiDB + auth) — verified against live TiDB
- [ ] Deploy to Render (blueprint ready in `render.yaml`)
- [ ] Content CMS in admin panel (edit lessons live)
- [ ] Later (optional, paid): swap simulators for real cloud tools
