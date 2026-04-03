# AutomateLearn Auth Backend

This backend uses Flask and a Supabase user table for email/password login, and Flask also serves the frontend pages from `backend/frontend`.

## 1. Create environment file

Copy `backend/.env.example` to `backend/.env` and add your real Supabase values:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_USERS_TABLE`
- `SUPABASE_LEARN_BLOCKS_TABLE`
- `SUPABASE_PRACTICE_ADVANCED_TABLE`
- `FLASK_SECRET_KEY`
- `ALLOWED_ORIGINS`

Use the Supabase project URL and the service role key from your Supabase dashboard. Because this Flask app performs server-side reads and inserts into the `users` table, the key must stay only in the backend `.env` file and never be exposed in frontend code. Set `FLASK_SECRET_KEY` to a long random string so login sessions are signed securely.
Set `SUPABASE_USERS_TABLE=ap_users` to use the new table name.
Set `SUPABASE_LEARN_BLOCKS_TABLE=ap_learn_blocks` to store admin-created Learn page content blocks.
Set `SUPABASE_PRACTICE_ADVANCED_TABLE=ap_practice_advanced_items` to store live advanced practice links and instructions.

## 2. Install dependencies

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 3. Start the backend

```powershell
.\start-dev.ps1
```

The site and API will run on `http://127.0.0.1:8000`.

If you want to run without auto-reload:

```powershell
python app.py
```

## 4. Open the frontend

Open:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/login`
- `http://127.0.0.1:8000/register`

## Notes

- Login checks the configured Supabase user table and verifies the entered password against `password_hash`.
- Registration creates a new row in the configured user table and stores a bcrypt hash in `password_hash`.
- `password_hash` must contain a valid bcrypt hash.
- The `start-dev.ps1` script starts Flask in debug mode for development.

## Create the `ap_users` table

Run the SQL in [backend/sql/create_ap_users.sql](C:\Users\saran\OneDrive\Desktop\Automation-learn\backend\sql\create_ap_users.sql) inside the Supabase SQL Editor, then keep `SUPABASE_USERS_TABLE=ap_users` in `backend/.env`.

## Create the `ap_learn_blocks` table

Run the SQL in [backend/sql/create_ap_learn_blocks.sql](C:\Users\saran\OneDrive\Desktop\Automation-learn\backend\sql\create_ap_learn_blocks.sql) inside the Supabase SQL Editor, then keep `SUPABASE_LEARN_BLOCKS_TABLE=ap_learn_blocks` in `backend/.env`.

## Create the `ap_practice_advanced_items` table

Run the SQL in [backend/sql/create_ap_practice_advanced_items.sql](C:\Users\saran\OneDrive\Desktop\Automation-learn\backend\sql\create_ap_practice_advanced_items.sql) inside the Supabase SQL Editor, then keep `SUPABASE_PRACTICE_ADVANCED_TABLE=ap_practice_advanced_items` in `backend/.env`.
