# Automation Pract

Automation Pract is a learning and practice project for web automation concepts. It includes a Flask backend, static frontend pages for hands-on practice, and Supabase-backed authentication/content data.

## Project Structure

```text
Automation-learn/
|-- backend/
|   |-- app.py
|   |-- otp_service.py
|   |-- url.py
|   |-- frontend/
|   |-- sql/
|   `-- README.md
|-- requirements.txt
|-- vercel.json
`-- README.md
```

## Features

- Flask backend for routes and API handling
- Frontend practice pages for common automation scenarios
- Login and registration flow backed by Supabase
- SQL scripts for required database tables
- Local development setup with Python virtual environment

## Tech Stack

- Python
- Flask
- Supabase
- HTML
- CSS
- JavaScript

## Getting Started

### 1. Create a virtual environment

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and fill in your real Supabase and app settings.

Required values include:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_USERS_TABLE`
- `SUPABASE_LEARN_BLOCKS_TABLE`
- `SUPABASE_PRACTICE_ADVANCED_TABLE`
- `FLASK_SECRET_KEY`
- `ALLOWED_ORIGINS`

### 3. Run the project

```powershell
cd backend
.\start-dev.ps1
```

The app runs locally at `http://127.0.0.1:8000`.

## Useful Pages

- `/`
- `/login`
- `/register`
- `/learn`
- `/practice`

## Database Setup

Run the SQL files inside `backend/sql/` in your Supabase SQL editor:

- `create_ap_users.sql`
- `create_ap_learn_blocks.sql`
- `create_ap_practice_advanced_items.sql`
- `create_ap_learn_block_requests.sql`

## Notes

- `backend/.env` is ignored by Git and should not be committed.
- `backend/.venv` is ignored by Git and should stay local.
- More backend-specific setup details are available in `backend/README.md`.
