import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

import bcrypt
from dotenv import load_dotenv
from flask import abort
from flask import Flask, jsonify, request
from flask import Response
from flask import session
from flask_cors import CORS
from supabase import create_client


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

from url import ALL_PAGE_URLS
from url import DEVELOPER_URL

FRONTEND_DIR = BASE_DIR / "frontend"
STATIC_DIR = FRONTEND_DIR / "static"

app = Flask(
  __name__,
  static_folder=str(STATIC_DIR),
  static_url_path="/static",
)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "change-this-secret-key")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.getenv("FLASK_ENV") == "production"


def get_env(name: str) -> str:
  value = os.getenv(name, "").strip()
  if not value:
    raise RuntimeError(f"Missing required environment variable: {name}")
  return value


def get_allowed_origins() -> list[str]:
  raw_value = os.getenv("ALLOWED_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000")
  return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


def get_users_table_name() -> str:
  return os.getenv("SUPABASE_USERS_TABLE", "ap_users").strip() or "ap_users"


def get_learn_blocks_table_name() -> str:
  return os.getenv("SUPABASE_LEARN_BLOCKS_TABLE", "ap_learn_blocks").strip() or "ap_learn_blocks"


def get_learn_block_requests_table_name() -> str:
  return os.getenv("SUPABASE_LEARN_REQUESTS_TABLE", "ap_learn_block_requests").strip() or "ap_learn_block_requests"


def get_practice_advanced_table_name() -> str:
  return os.getenv("SUPABASE_PRACTICE_ADVANCED_TABLE", "ap_practice_advanced_items").strip() or "ap_practice_advanced_items"


CORS(
  app,
  resources={r"/api/*": {"origins": get_allowed_origins()}},
  supports_credentials=True,
)


def get_supabase_client():
  return create_client(
    get_env("SUPABASE_URL"),
    get_env("SUPABASE_SERVICE_ROLE_KEY"),
  )


def get_user_by_email(email: str):
  response = (
    get_supabase_client()
    .table(get_users_table_name())
    .select("id, name, email, password_hash, phone, role, page_status, avatar_url, created_at, updated_at")
    .eq("email", email)
    .limit(1)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def get_user_by_id(user_id: str):
  response = (
    get_supabase_client()
    .table(get_users_table_name())
    .select("id, name, email, password_hash, phone, role, page_status, avatar_url, created_at, updated_at")
    .eq("id", user_id)
    .limit(1)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def list_users():
  response = (
    get_supabase_client()
    .table(get_users_table_name())
    .select("id, name, email, phone, role, page_status, avatar_url, created_at, updated_at")
    .order("created_at", desc=True)
    .execute()
  )

  return getattr(response, "data", None) or []


def hash_password(password: str) -> str:
  return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_user(name: str, email: str, password: str, phone: str = "", role: str = "user"):
  response = (
    get_supabase_client()
    .table(get_users_table_name())
    .insert(
      {
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "phone": phone or None,
        "role": role,
      }
    )
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def get_allowed_avatar_paths() -> set[str]:
  return {f"/static/avatars/avatar{index}.svg" for index in range(11)}


def normalize_avatar_url(avatar_url: str | None) -> str:
  candidate = str(avatar_url or "").strip()
  allowed_avatar_paths = get_allowed_avatar_paths()
  if candidate in allowed_avatar_paths:
    return candidate
  return "/static/avatars/avatar0.svg"


def update_user_profile(user_id: str, name: str, phone: str, avatar_url: str):
  response = (
    get_supabase_client()
    .table(get_users_table_name())
    .update({
      "name": name,
      "phone": phone or None,
      "avatar_url": normalize_avatar_url(avatar_url),
      "updated_at": "now()",
    })
    .eq("id", user_id)
    .execute()
  )
  data = getattr(response, "data", None) or []
  return data[0] if data else None


def update_user_password(user_id: str, password_hash: str):
  response = (
    get_supabase_client()
    .table(get_users_table_name())
    .update({"password_hash": password_hash, "updated_at": "now()"})
    .eq("id", user_id)
    .execute()
  )
  data = getattr(response, "data", None) or []
  return data[0] if data else None


def update_user_role(user_id: str, role: str):
  response = (
    get_supabase_client()
    .table(get_users_table_name())
    .update({"role": role, "updated_at": "now()"})
    .eq("id", user_id)
    .execute()
  )
  data = getattr(response, "data", None) or []
  return data[0] if data else None


def update_user_page_status(user_id: str, page_status: bool):
  response = (
    get_supabase_client()
    .table(get_users_table_name())
    .update({"page_status": page_status, "updated_at": "now()"})
    .eq("id", user_id)
    .execute()
  )
  data = getattr(response, "data", None) or []
  return data[0] if data else None


def delete_user(user_id: str) -> bool:
  response = (
    get_supabase_client()
    .table(get_users_table_name())
    .delete()
    .eq("id", user_id)
    .execute()
  )
  data = getattr(response, "data", None) or []
  return bool(data)


def list_learn_blocks(topic: str):
  response = (
    get_supabase_client()
    .table(get_learn_blocks_table_name())
    .select(
      "id, topic, block_type, content, text_color, font_size, text_align, display_order, "
      "created_by, created_by_name, last_edited_by, last_edited_by_name, last_edited_at, created_at"
    )
    .eq("topic", topic)
    .order("display_order")
    .order("created_at")
    .execute()
  )

  return getattr(response, "data", None) or []


def get_learn_block_by_id(block_id: str):
  response = (
    get_supabase_client()
    .table(get_learn_blocks_table_name())
    .select(
      "id, topic, block_type, content, text_color, font_size, text_align, display_order, "
      "created_by, created_by_name, last_edited_by, last_edited_by_name, last_edited_at, created_at"
    )
    .eq("id", block_id)
    .limit(1)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def create_learn_block(
  topic: str,
  block_type: str,
  content: str,
  text_color: str,
  font_size: int,
  text_align: str,
  created_by: str | None = None,
  created_by_name: str | None = None,
):
  existing_blocks = list_learn_blocks(topic)
  next_display_order = len(existing_blocks) + 1

  response = (
    get_supabase_client()
    .table(get_learn_blocks_table_name())
    .insert(
      {
        "topic": topic,
        "block_type": block_type,
        "content": content,
        "text_color": text_color,
        "font_size": font_size,
        "text_align": text_align,
        "display_order": next_display_order,
        "created_by": created_by,
        "created_by_name": created_by_name,
        "last_edited_by": created_by,
        "last_edited_by_name": created_by_name,
      }
    )
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def update_learn_block(
  block_id: str,
  block_type: str,
  content: str,
  text_color: str,
  font_size: int,
  text_align: str,
  edited_by: str | None = None,
  edited_by_name: str | None = None,
):
  response = (
    get_supabase_client()
    .table(get_learn_blocks_table_name())
    .update(
      {
        "block_type": block_type,
        "content": content,
        "text_color": text_color,
        "font_size": font_size,
        "text_align": text_align,
        "last_edited_by": edited_by,
        "last_edited_by_name": edited_by_name,
        "last_edited_at": "now()",
      }
    )
    .eq("id", block_id)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def delete_learn_block(block_id: str) -> bool:
  response = (
    get_supabase_client()
    .table(get_learn_blocks_table_name())
    .delete()
    .eq("id", block_id)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return bool(data)


def list_learn_block_requests(owner_id: str | None = None):
  query = (
    get_supabase_client()
    .table(get_learn_block_requests_table_name())
    .select(
      "id, block_id, topic, request_type, requester_id, requester_name, owner_id, owner_name, "
      "requested_comment, status, decision_comment, decided_by, decided_by_name, decided_at, created_at"
    )
    .order("created_at", desc=True)
  )

  if owner_id:
    query = query.eq("owner_id", owner_id)

  response = query.execute()
  return getattr(response, "data", None) or []


def list_learn_block_requests_related_to_user(user_id: str):
  owned_requests = list_learn_block_requests(user_id)
  requester_requests = list_learn_block_requests_for_requester(user_id)

  combined_requests: dict[str, dict] = {}
  for item in [*owned_requests, *requester_requests]:
    request_id = str(item.get("id") or "")
    if request_id:
      combined_requests[request_id] = item

  return sorted(
    combined_requests.values(),
    key=lambda item: str(item.get("created_at") or ""),
    reverse=True,
  )


def get_learn_block_request_by_id(request_id: str):
  response = (
    get_supabase_client()
    .table(get_learn_block_requests_table_name())
    .select(
      "id, block_id, topic, request_type, requester_id, requester_name, owner_id, owner_name, "
      "requested_comment, status, decision_comment, decided_by, decided_by_name, decided_at, created_at"
    )
    .eq("id", request_id)
    .limit(1)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def find_pending_request_for_block(block_id: str, requester_id: str, request_type: str):
  response = (
    get_supabase_client()
    .table(get_learn_block_requests_table_name())
    .select(
      "id, block_id, topic, request_type, requester_id, requester_name, owner_id, owner_name, "
      "requested_comment, status, decision_comment, decided_by, decided_by_name, decided_at, created_at"
    )
    .eq("block_id", block_id)
    .eq("requester_id", requester_id)
    .eq("request_type", request_type)
    .eq("status", "pending")
    .limit(1)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def find_latest_request_for_block(block_id: str, requester_id: str, request_type: str):
  response = (
    get_supabase_client()
    .table(get_learn_block_requests_table_name())
    .select(
      "id, block_id, topic, request_type, requester_id, requester_name, owner_id, owner_name, "
      "requested_comment, status, decision_comment, decided_by, decided_by_name, decided_at, created_at"
    )
    .eq("block_id", block_id)
    .eq("requester_id", requester_id)
    .eq("request_type", request_type)
    .order("created_at", desc=True)
    .limit(1)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def create_learn_block_request(
  block_id: str,
  topic: str,
  request_type: str,
  requester_id: str,
  requester_name: str,
  owner_id: str,
  owner_name: str,
  requested_comment: str,
):
  response = (
    get_supabase_client()
    .table(get_learn_block_requests_table_name())
    .insert(
      {
        "block_id": block_id,
        "topic": topic,
        "request_type": request_type,
        "requester_id": requester_id,
        "requester_name": requester_name,
        "owner_id": owner_id,
        "owner_name": owner_name,
        "requested_comment": requested_comment,
      }
    )
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def decide_learn_block_request(
  request_id: str,
  status: str,
  decision_comment: str,
  decided_by: str,
  decided_by_name: str,
):
  response = (
    get_supabase_client()
    .table(get_learn_block_requests_table_name())
    .update(
      {
        "status": status,
        "decision_comment": decision_comment,
        "decided_by": decided_by,
        "decided_by_name": decided_by_name,
        "decided_at": "now()",
      }
    )
    .eq("id", request_id)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def list_practice_advanced_items():
  response = (
    get_supabase_client()
    .table(get_practice_advanced_table_name())
    .select("id, title, description, button_text, target_url, display_order, created_at, updated_at")
    .order("display_order")
    .order("created_at")
    .execute()
  )

  return getattr(response, "data", None) or []


def create_practice_advanced_item(title: str, description: str, button_text: str, target_url: str):
  existing_items = list_practice_advanced_items()
  next_display_order = len(existing_items) + 1

  response = (
    get_supabase_client()
    .table(get_practice_advanced_table_name())
    .insert(
      {
        "title": title,
        "description": description,
        "button_text": button_text,
        "target_url": target_url,
        "display_order": next_display_order,
      }
    )
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def update_practice_advanced_item(item_id: str, title: str, description: str, button_text: str, target_url: str):
  response = (
    get_supabase_client()
    .table(get_practice_advanced_table_name())
    .update(
      {
        "title": title,
        "description": description,
        "button_text": button_text,
        "target_url": target_url,
      }
    )
    .eq("id", item_id)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return data[0] if data else None


def delete_practice_advanced_item(item_id: str) -> bool:
  response = (
    get_supabase_client()
    .table(get_practice_advanced_table_name())
    .delete()
    .eq("id", item_id)
    .execute()
  )

  data = getattr(response, "data", None) or []
  return bool(data)


def verify_password(password: str, password_hash: str) -> bool:
  if not password_hash:
    return False

  try:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
  except ValueError:
    return False


def normalize_phone(phone: str) -> str:
  digits_only = "".join(char for char in phone if char.isdigit())
  if len(digits_only) == 12 and digits_only.startswith("91"):
    digits_only = digits_only[2:]
  return digits_only


def get_bootstrap_admin_email() -> str:
  return os.getenv("BOOTSTRAP_ADMIN_EMAIL", "saransketch2@gmail.com").strip().lower()


def ensure_bootstrap_admin(user: dict | None):
  if not user:
    return user

  bootstrap_admin_email = get_bootstrap_admin_email()
  user_email = str(user.get("email", "")).strip().lower()
  if user_email != bootstrap_admin_email or user.get("role") == "admin":
    return user

  updated_user = update_user_role(str(user.get("id")), "admin")
  return updated_user or user


def build_user_payload(user: dict):
  return {
    "id": user.get("id"),
    "name": user.get("name"),
    "email": user.get("email"),
    "phone": user.get("phone"),
    "role": user.get("role"),
    "page_status": bool(user.get("page_status", False)),
    "avatar_url": normalize_avatar_url(user.get("avatar_url")),
    "created_at": user.get("created_at"),
    "updated_at": user.get("updated_at"),
  }


def store_auth_user(user_payload: dict):
  session["auth_user"] = {
    "id": user_payload["id"],
    "email": user_payload["email"],
    "name": user_payload["name"],
    "phone": user_payload["phone"],
    "role": user_payload["role"],
    "page_status": bool(user_payload.get("page_status", False)),
  }


def require_admin():
  auth_user = session.get("auth_user")
  if not auth_user:
    return None, (jsonify({"detail": "Not authenticated"}), 401)

  if auth_user.get("role") != "admin":
    return None, (jsonify({"detail": "Admin access required"}), 403)

  return auth_user, None


def require_admin_or_staff():
  auth_user = session.get("auth_user")
  if not auth_user:
    return None, (jsonify({"detail": "Not authenticated"}), 401)

  if auth_user.get("role") not in {"admin", "staff"}:
    return None, (jsonify({"detail": "Admin or staff access required"}), 403)

  return auth_user, None


def require_authenticated_user():
  auth_user = session.get("auth_user")
  if not auth_user:
    return None, (jsonify({"detail": "Not authenticated"}), 401)

  return auth_user, None


def is_admin_user(user: dict | None) -> bool:
  return bool(user and user.get("role") == "admin")


def is_staff_user(user: dict | None) -> bool:
  return bool(user and user.get("role") == "staff")


def list_learn_block_requests_for_requester(requester_id: str, status: str | None = None):
  query = (
    get_supabase_client()
    .table(get_learn_block_requests_table_name())
    .select(
      "id, block_id, topic, request_type, requester_id, requester_name, owner_id, owner_name, "
      "requested_comment, status, decision_comment, decided_by, decided_by_name, decided_at, created_at"
    )
    .eq("requester_id", requester_id)
    .order("created_at", desc=True)
  )

  if status:
    query = query.eq("status", status)

  response = query.execute()
  return getattr(response, "data", None) or []


def build_request_permission_map(requests: list[dict]) -> dict[str, set[str]]:
  permission_map: dict[str, set[str]] = {}
  for item in requests:
    block_id = str(item.get("block_id") or "")
    request_type = str(item.get("request_type") or "")
    if not block_id or not request_type:
      continue
    permission_map.setdefault(block_id, set()).add(request_type)
  return permission_map


def build_request_status_map(requests: list[dict]) -> dict[str, dict[str, str]]:
  status_map: dict[str, dict[str, str]] = {}
  for item in requests:
    block_id = str(item.get("block_id") or "")
    request_type = str(item.get("request_type") or "")
    status = str(item.get("status") or "")
    if not block_id or not request_type or not status:
      continue
    block_entry = status_map.setdefault(block_id, {})
    if request_type not in block_entry:
      block_entry[request_type] = status
  return status_map


def build_request_detail_map(requests: list[dict]) -> dict[str, dict[str, dict]]:
  detail_map: dict[str, dict[str, dict]] = {}
  for item in requests:
    block_id = str(item.get("block_id") or "")
    request_type = str(item.get("request_type") or "")
    if not block_id or not request_type:
      continue

    block_entry = detail_map.setdefault(block_id, {})
    if request_type not in block_entry:
      block_entry[request_type] = {
        "status": str(item.get("status") or ""),
        "requested_comment": str(item.get("requested_comment") or ""),
        "decision_comment": str(item.get("decision_comment") or ""),
        "decided_at": item.get("decided_at"),
        "created_at": item.get("created_at"),
      }
  return detail_map


def parse_iso_datetime(value):
  raw_value = str(value or "").strip()
  if not raw_value:
    return None

  try:
    return datetime.fromisoformat(raw_value.replace("Z", "+00:00"))
  except ValueError:
    return None


def evaluate_rejected_request_retry(latest_request: dict | None, requested_comment: str):
  if not latest_request or str(latest_request.get("status") or "") != "rejected":
    return None

  decided_at = parse_iso_datetime(latest_request.get("decided_at")) or parse_iso_datetime(latest_request.get("created_at"))
  if not decided_at:
    return None

  now = datetime.now(timezone.utc)
  one_minute_deadline = decided_at + timedelta(minutes=1)
  cooldown_deadline = decided_at + timedelta(hours=12)
  previous_comment = str(latest_request.get("requested_comment") or "").strip()
  is_same_comment = previous_comment == requested_comment

  if is_same_comment and now <= one_minute_deadline:
    return {
      "allowed": True,
      "message": "This rejected request can be resent with the same comment for 1 minute after rejection.",
    }

  if now < cooldown_deadline:
    retry_after_text = cooldown_deadline.astimezone().strftime("%Y-%m-%d %I:%M %p")
    return {
      "allowed": False,
      "message": f"This request was rejected. You can resend the same comment only within 1 minute of rejection; otherwise please wait until {retry_after_text}.",
    }

  return {
    "allowed": True,
    "message": "",
  }


def can_manage_learn_block(auth_user: dict, block: dict, action: str, request_permission_map: dict[str, set[str]] | None = None) -> bool:
  if is_admin_user(auth_user):
    return True
  if not is_staff_user(auth_user):
    return False

  auth_user_id = str(auth_user.get("id") or "")
  if str(block.get("created_by") or "") == auth_user_id:
    return True

  granted_permissions = (request_permission_map or {}).get(str(block.get("id") or ""), set())
  return action in granted_permissions


def serialize_learn_block(
  block: dict,
  auth_user: dict | None = None,
  request_permission_map: dict[str, set[str]] | None = None,
  request_status_map: dict[str, dict[str, str]] | None = None,
  request_detail_map: dict[str, dict[str, dict]] | None = None,
):
  serialized = dict(block)
  created_by = str(block.get("created_by") or "")
  auth_user_id = str((auth_user or {}).get("id") or "")
  is_admin = is_admin_user(auth_user)
  is_owner = bool(auth_user_id and created_by and auth_user_id == created_by)
  is_staff = is_staff_user(auth_user)
  granted_permissions = (request_permission_map or {}).get(str(block.get("id") or ""), set())
  request_statuses = (request_status_map or {}).get(str(block.get("id") or ""), {})
  request_details = (request_detail_map or {}).get(str(block.get("id") or ""), {})
  serialized["can_edit"] = is_admin or is_owner or ("edit" in granted_permissions)
  serialized["can_delete"] = is_admin or is_owner or ("delete" in granted_permissions)
  serialized["edit_request_status"] = request_statuses.get("edit", "")
  serialized["delete_request_status"] = request_statuses.get("delete", "")
  serialized["edit_request_detail"] = request_details.get("edit", {})
  serialized["delete_request_detail"] = request_details.get("delete", {})
  serialized["can_request_edit"] = bool(
    is_staff
    and not is_owner
    and not is_admin
    and created_by
    and not serialized["can_edit"]
    and serialized["edit_request_status"] != "pending"
  )
  serialized["can_request_delete"] = bool(
    is_staff
    and not is_owner
    and not is_admin
    and created_by
    and not serialized["can_delete"]
    and serialized["delete_request_status"] != "pending"
  )
  serialized["is_owner"] = is_owner
  return serialized


def can_view_developer_page() -> bool:
  auth_user = session.get("auth_user")
  if not auth_user:
    return False

  try:
    user = get_user_by_id(str(auth_user.get("id", "")))
  except Exception:
    return False

  if not user or user.get("role") == "blocked":
    return False

  user_payload = build_user_payload(user)
  store_auth_user(user_payload)
  return bool(user_payload.get("page_status"))


def resolve_page_filename(page_name: str) -> str:
  normalized = page_name.strip().strip("/")
  if not normalized:
    return "index.html"

  candidate = normalized if normalized.endswith(".html") else f"{normalized}.html"

  if not (FRONTEND_DIR / candidate).exists():
    raise FileNotFoundError(candidate)

  return candidate


def get_active_section(page: str) -> str:
  if not page or page == "index.html":
    return "home"

  if page == "learn.html":
    return "learn"

  if page == "admin.html":
    return "admin"

  if page == "staff.html":
    return "staff"

  if page == "login.html":
    return "login"

  if page == "register.html":
    return "register"

  if page == "profile.html":
    return "profile"

  if page == "practice.html" or page.startswith("practice-") or page == "checkbox.html" or page == "fileupload.html":
    return "practice"

  return ""


def build_header_html(active: str) -> str:
  return f"""
      <header class="header" id="header">
        <div class="header-inner">
          <a href="/" class="logo">
            <div class="logo-icon"></div>
            <span>AutomateLearn</span>
          </a>
          <nav class="nav-links" id="navLinks">
            <a href="/" class="{'active' if active == 'home' else ''}">Home</a>
            <a href="/learn" class="{'active' if active == 'learn' else ''}">Learn</a>
            <a href="/practice" class="{'active' if active == 'practice' else ''}">Practice Lab</a>
            <a href="/staff" class="{'active' if active == 'staff' else ''}" id="navStaffBtn" hidden>Staff</a>
            <a href="/admin" class="{'active' if active == 'admin' else ''}" id="navAdminBtn" hidden>Admin</a>
            <a href="/login" class="{'active' if active in {'login', 'profile'} else ''}" id="navLoginBtn">Login</a>
          </nav>
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme"></button>
          <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
    """


def render_shared_layout_placeholders(filename: str, html: str) -> str:
  header_placeholder = '<div id="siteHeader"></div>'

  if header_placeholder not in html:
    return html

  active_section = get_active_section(filename)
  return html.replace(header_placeholder, build_header_html(active_section), 1)


def serve_page(filename: str):
  file_path = FRONTEND_DIR / filename
  html = file_path.read_text(encoding="utf-8")
  rendered_html = render_shared_layout_placeholders(filename, html)
  return Response(rendered_html, mimetype="text/html")


@app.errorhandler(404)
def handle_not_found(error):
  if request.path.startswith("/api/"):
    return jsonify({"detail": "API route not found"}), 404
  return error


@app.errorhandler(500)
def handle_server_error(error):
  if request.path.startswith("/api/"):
    return jsonify({"detail": "Internal server error"}), 500
  return error


@app.get("/api/health")
def health_check():
  return jsonify({"status": "ok"})


@app.get("/api/routes")
def page_routes():
  return jsonify(ALL_PAGE_URLS)


@app.get("/api/learn/blocks")
def get_learn_blocks():
  topic = str(request.args.get("topic", "")).strip().lower()
  allowed_topics = {"java", "selenium", "testng", "maven", "extent", "eclipse", "pom"}
  auth_user = session.get("auth_user")

  if topic not in allowed_topics:
    return jsonify({"detail": "Invalid topic"}), 400

  try:
    blocks = list_learn_blocks(topic)
    request_permission_map = {}
    request_status_map = {}
    request_detail_map = {}
    if auth_user and is_staff_user(auth_user):
      requester_requests = list_learn_block_requests_for_requester(str(auth_user.get("id") or ""))
      accepted_requests = [item for item in requester_requests if item.get("status") == "accepted"]
      request_permission_map = build_request_permission_map(accepted_requests)
      request_status_map = build_request_status_map(requester_requests)
      request_detail_map = build_request_detail_map(requester_requests)

    return jsonify({
      "blocks": [
        serialize_learn_block(block, auth_user, request_permission_map, request_status_map, request_detail_map)
        for block in blocks
      ]
    })
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500


@app.get("/api/practice-advanced/items")
def get_practice_advanced_items():
  try:
    items = list_practice_advanced_items()
    return jsonify({"items": items})
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500


def validate_practice_advanced_payload(payload: dict):
  title = str(payload.get("title", "")).strip()
  description = str(payload.get("description", "")).strip()
  button_text = str(payload.get("button_text", "")).strip()
  target_url = str(payload.get("target_url", "")).strip()

  if len(title) < 2:
    return None, (jsonify({"detail": "Title must be at least 2 characters."}), 400)

  if len(description) < 10:
    return None, (jsonify({"detail": "Description must be at least 10 characters."}), 400)

  if len(button_text) < 2:
    return None, (jsonify({"detail": "Button name must be at least 2 characters."}), 400)

  if not (target_url.startswith("http://") or target_url.startswith("https://")):
    return None, (jsonify({"detail": "Link must start with http:// or https://"}), 400)

  return {
    "title": title,
    "description": description,
    "button_text": button_text,
    "target_url": target_url,
  }, None


def validate_learn_block_payload(payload: dict, require_topic: bool = True):
  topic = str(payload.get("topic", "")).strip().lower()
  block_type = str(payload.get("block_type", "")).strip().lower()
  content = str(payload.get("content", "")).strip()
  text_color = str(payload.get("text_color", "black")).strip().lower() or "black"
  text_align = str(payload.get("text_align", "left")).strip().lower() or "left"

  try:
    font_size = int(payload.get("font_size", 18))
  except (TypeError, ValueError):
    font_size = 18

  allowed_topics = {"java", "selenium", "testng", "maven", "extent", "eclipse", "pom"}
  allowed_block_types = {"heading", "subheading", "content", "code"}
  allowed_alignments = {"left", "center", "right"}
  allowed_colors = {"black", "white", "blue", "red", "green", "yellow", "orange", "purple", "pink", "gray"}

  if require_topic and topic not in allowed_topics:
    return None, (jsonify({"detail": "Invalid topic"}), 400)

  if block_type not in allowed_block_types:
    return None, (jsonify({"detail": "Invalid block type"}), 400)

  if text_align not in allowed_alignments:
    return None, (jsonify({"detail": "Invalid text alignment"}), 400)

  if len(content) < 2:
    return None, (jsonify({"detail": "Content must be at least 2 characters."}), 400)

  if text_color not in allowed_colors:
    return None, (jsonify({"detail": "Text color must be one of the allowed color names."}), 400)

  return {
    "topic": topic,
    "block_type": block_type,
    "content": content,
    "text_color": text_color,
    "font_size": max(12, min(font_size, 72)),
    "text_align": text_align,
  }, None


def validate_request_comment(value: str, field_label: str):
  comment = str(value or "").replace("\r\n", "\n").strip()
  if len(comment) < 40:
    return None, (jsonify({"detail": f"{field_label} must be at least 40 characters."}), 400)
  return comment, None


@app.post("/api/editor/practice-advanced/items")
def editor_create_practice_advanced_item():
  _, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  payload, validation_error = validate_practice_advanced_payload(request.get_json(silent=True) or {})
  if validation_error:
    return validation_error

  try:
    item = create_practice_advanced_item(**payload)
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not item:
    return jsonify({"detail": "Could not create practice item."}), 500

  return jsonify({"message": "Practice item added successfully", "item": item}), 201


@app.put("/api/editor/practice-advanced/items/<item_id>")
def editor_update_practice_advanced_item(item_id: str):
  _, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  payload, validation_error = validate_practice_advanced_payload(request.get_json(silent=True) or {})
  if validation_error:
    return validation_error

  try:
    item = update_practice_advanced_item(item_id, **payload)
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not item:
    return jsonify({"detail": "Could not update practice item."}), 404

  return jsonify({"message": "Practice item updated successfully", "item": item})


@app.delete("/api/editor/practice-advanced/items/<item_id>")
def editor_delete_practice_advanced_item(item_id: str):
  _, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  try:
    deleted = delete_practice_advanced_item(item_id)
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not deleted:
    return jsonify({"detail": "Could not delete practice item."}), 404

  return jsonify({"message": "Practice item deleted successfully"})


@app.post("/api/editor/learn/blocks")
def editor_create_learn_block():
  auth_user, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  payload, validation_error = validate_learn_block_payload(request.get_json(silent=True) or {}, require_topic=True)
  if validation_error:
    return validation_error

  try:
    block = create_learn_block(
      payload["topic"],
      payload["block_type"],
      payload["content"],
      payload["text_color"],
      payload["font_size"],
      payload["text_align"],
      created_by=str(auth_user.get("id") or ""),
      created_by_name=str(auth_user.get("name") or auth_user.get("email") or ""),
    )
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not block:
    return jsonify({"detail": "Could not create learn block."}), 500

  return jsonify({"message": "Learn block added successfully", "block": serialize_learn_block(block, auth_user)}), 201


@app.put("/api/editor/learn/blocks/<block_id>")
def editor_update_learn_block(block_id: str):
  auth_user, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  payload, validation_error = validate_learn_block_payload(request.get_json(silent=True) or {}, require_topic=False)
  if validation_error:
    return validation_error

  block = get_learn_block_by_id(block_id)
  if not block:
    return jsonify({"detail": "Could not update learn block."}), 404

  request_permission_map = {}
  if is_staff_user(auth_user):
    accepted_requests = list_learn_block_requests_for_requester(str(auth_user.get("id") or ""), status="accepted")
    request_permission_map = build_request_permission_map(accepted_requests)

  if not can_manage_learn_block(auth_user, block, "edit", request_permission_map):
    return jsonify({"detail": "Only the creator or an admin can edit this content directly."}), 403

  try:
    block = update_learn_block(
      block_id,
      payload["block_type"],
      payload["content"],
      payload["text_color"],
      payload["font_size"],
      payload["text_align"],
      edited_by=str(auth_user.get("id") or ""),
      edited_by_name=str(auth_user.get("name") or auth_user.get("email") or ""),
    )
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not block:
    return jsonify({"detail": "Could not update learn block."}), 404

  return jsonify({"message": "Learn block updated successfully", "block": serialize_learn_block(block, auth_user, request_permission_map)})


@app.delete("/api/editor/learn/blocks/<block_id>")
def editor_delete_learn_block(block_id: str):
  auth_user, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  block = get_learn_block_by_id(block_id)
  if not block:
    return jsonify({"detail": "Could not delete learn block."}), 404

  request_permission_map = {}
  if is_staff_user(auth_user):
    accepted_requests = list_learn_block_requests_for_requester(str(auth_user.get("id") or ""), status="accepted")
    request_permission_map = build_request_permission_map(accepted_requests)

  if not can_manage_learn_block(auth_user, block, "delete", request_permission_map):
    return jsonify({"detail": "Only the creator or an admin can delete this content directly."}), 403

  try:
    deleted = delete_learn_block(block_id)
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not deleted:
    return jsonify({"detail": "Could not delete learn block."}), 404

  return jsonify({"message": "Learn block deleted successfully"})


@app.post("/api/staff/learn/requests")
def create_staff_learn_request():
  auth_user, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  if is_admin_user(auth_user):
    return jsonify({"detail": "Admins do not need to request edit access."}), 400

  payload = request.get_json(silent=True) or {}
  block_id = str(payload.get("block_id", "")).strip()
  request_type = str(payload.get("request_type", "")).strip().lower()
  requested_comment = str(payload.get("requested_comment", "")).strip()

  if request_type not in {"edit", "delete"}:
    return jsonify({"detail": "Invalid request type."}), 400

  if len(requested_comment) < 10:
    return jsonify({"detail": "Request comment must be at least 10 characters."}), 400

  block = get_learn_block_by_id(block_id)
  if not block:
    return jsonify({"detail": "Learn content not found."}), 404

  owner_id = str(block.get("created_by") or "")
  owner_name = str(block.get("created_by_name") or "Content owner")
  requester_id = str(auth_user.get("id") or "")

  if not owner_id:
    return jsonify({"detail": "This content does not have an owner yet."}), 400

  if owner_id == requester_id:
    return jsonify({"detail": "You already own this content."}), 400

  existing_request = find_pending_request_for_block(block_id, requester_id, request_type)
  if existing_request:
    return jsonify({"detail": "You already have a pending request for this content."}), 409

  latest_request = find_latest_request_for_block(block_id, requester_id, request_type)
  retry_rule = evaluate_rejected_request_retry(latest_request, requested_comment)
  if retry_rule and not retry_rule["allowed"]:
    return jsonify({"detail": retry_rule["message"]}), 409

  try:
    created_request = create_learn_block_request(
      block_id=block_id,
      topic=str(block.get("topic") or ""),
      request_type=request_type,
      requester_id=requester_id,
      requester_name=str(auth_user.get("name") or auth_user.get("email") or ""),
      owner_id=owner_id,
      owner_name=owner_name,
      requested_comment=requested_comment,
    )
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not created_request:
    return jsonify({"detail": "Could not create request."}), 500

  return jsonify({"message": "Permission request sent successfully.", "request": created_request}), 201


@app.get("/api/staff/users")
def staff_list_users():
  _, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  try:
    users = [build_user_payload(user) for user in list_users()]
    return jsonify({"users": users})
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500


@app.get("/api/staff/learn/requests")
def get_staff_learn_requests():
  auth_user, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  try:
    requests = (
      list_learn_block_requests()
      if is_admin_user(auth_user)
      else list_learn_block_requests_related_to_user(str(auth_user.get("id") or ""))
    )
    return jsonify({"requests": requests})
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500


@app.post("/api/staff/learn/requests/<request_id>/decision")
def decide_staff_learn_request(request_id: str):
  auth_user, error_response = require_admin_or_staff()
  if error_response:
    return error_response

  payload = request.get_json(silent=True) or {}
  status = str(payload.get("status", "")).strip().lower()
  decision_comment, validation_error = validate_request_comment(payload.get("decision_comment", ""), "Decision comment")
  if validation_error:
    return validation_error

  if status not in {"accepted", "rejected"}:
    return jsonify({"detail": "Invalid decision status."}), 400

  learn_request = get_learn_block_request_by_id(request_id)
  if not learn_request:
    return jsonify({"detail": "Request not found."}), 404

  if learn_request.get("status") != "pending":
    return jsonify({"detail": "This request has already been decided."}), 400

  if not is_admin_user(auth_user) and str(learn_request.get("owner_id") or "") != str(auth_user.get("id") or ""):
    return jsonify({"detail": "Only the content owner can decide this request."}), 403

  try:
    updated_request = decide_learn_block_request(
      request_id=request_id,
      status=status,
      decision_comment=decision_comment,
      decided_by=str(auth_user.get("id") or ""),
      decided_by_name=str(auth_user.get("name") or auth_user.get("email") or ""),
    )
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not updated_request:
    return jsonify({"detail": "Could not update request."}), 500

  return jsonify({"message": f"Request {status} successfully.", "request": updated_request})


@app.post("/api/auth/login")
def login():
  payload = request.get_json(silent=True) or {}
  email = str(payload.get("email", "")).strip()
  password = str(payload.get("password", ""))

  if len(email) < 5 or len(password) < 6:
    return jsonify({"detail": "Email and password are required."}), 400

  try:
    user = ensure_bootstrap_admin(get_user_by_email(email))
  except RuntimeError as exc:
    return jsonify({"detail": str(exc)}), 500
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not user:
    return jsonify({"detail": "Invalid login credentials"}), 401

  if user.get("role") == "blocked":
    return jsonify({"detail": "Your account has been blocked. Please contact admin."}), 403

  if not verify_password(password, str(user.get("password_hash", ""))):
    return jsonify({"detail": "Invalid login credentials"}), 401

  user_payload = build_user_payload(user)
  store_auth_user(user_payload)
  session.permanent = True

  return jsonify(
    {
      "message": "Login successful",
      "user": user_payload,
      "source": "users_table",
    }
  )


import otp_service

@app.post("/api/auth/register")
def register():
  payload = request.get_json(silent=True) or {}
  name = str(payload.get("name", "")).strip()
  email = str(payload.get("email", "")).strip().lower()
  password = str(payload.get("password", ""))
  phone = str(payload.get("phone", "")).strip()

  if len(name) < 2:
    return jsonify({"detail": "Name is required."}), 400

  if len(email) < 5 or "@" not in email:
    return jsonify({"detail": "Valid email is required."}), 400

  if len(password) < 6:
    return jsonify({"detail": "Password must be at least 6 characters."}), 400

  normalized_phone = normalize_phone(phone)
  if len(normalized_phone) != 10:
    return jsonify({"detail": "Mobile number must be exactly 10 digits."}), 400

  try:
    existing_user = get_user_by_email(email)
    if existing_user:
      return jsonify({"detail": "Email is already registered."}), 409

    # Generate and send OTP, saving user details in memory
    otp_service.send_otp(email, {
        "name": name,
        "email": email,
        "password": password,
        "phone": normalized_phone
    })
    return jsonify({"message": "OTP sent successfully.", "email": email}), 200
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500


@app.post("/api/auth/verify-registration")
def verify_registration():
  payload = request.get_json(silent=True) or {}
  email = str(payload.get("email", "")).strip().lower()
  otp = str(payload.get("otp", "")).strip()

  if not email or not otp:
    return jsonify({"detail": "Email and OTP are required."}), 400

  is_valid, result = otp_service.verify_otp(email, otp)
  if not is_valid:
    return jsonify({"detail": result}), 400

  user_details = result
  try:
    user = create_user(
        name=user_details["name"],
        email=user_details["email"],
        password=user_details["password"],
        phone=user_details["phone"]
    )
    user = ensure_bootstrap_admin(user)
    otp_service.clear_otp(email)
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not user:
    return jsonify({"detail": "Could not create user."}), 500

  user_payload = build_user_payload(user)
  store_auth_user(user_payload)
  session.permanent = True

  return jsonify(
    {
      "message": "Registration successful",
      "user": user_payload,
      "source": "users_table",
    }
  ), 201


@app.post("/api/auth/resend-registration-otp")
def resend_registration_otp():
  payload = request.get_json(silent=True) or {}
  email = str(payload.get("email", "")).strip().lower()

  if not email:
    return jsonify({"detail": "Email is required."}), 400

  success, msg = otp_service.resend_otp(email)
  if not success:
    return jsonify({"detail": msg}), 400

  return jsonify({"message": "OTP resent successfully."}), 200


@app.post("/api/auth/forgot-password")
def forgot_password():
  payload = request.get_json(silent=True) or {}
  email = str(payload.get("email", "")).strip().lower()

  if len(email) < 5 or "@" not in email:
    return jsonify({"detail": "Valid email is required."}), 400

  try:
    user = get_user_by_email(email)
    if not user:
      return jsonify({"detail": "No account found for this email."}), 404

    otp_service.send_password_reset_otp(email)
    meta = otp_service.get_password_reset_meta(email) or {}
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  return jsonify({
    "message": "OTP sent successfully.",
    "email": email,
    "expires_at": meta.get("expires_at"),
    "resend_available_at": meta.get("resend_available_at"),
  }), 200


@app.post("/api/auth/resend-forgot-password-otp")
def resend_forgot_password_otp():
  payload = request.get_json(silent=True) or {}
  email = str(payload.get("email", "")).strip().lower()

  if len(email) < 5 or "@" not in email:
    return jsonify({"detail": "Valid email is required."}), 400

  try:
    user = get_user_by_email(email)
    if not user:
      return jsonify({"detail": "No account found for this email."}), 404

    success, message = otp_service.resend_password_reset_otp(email)
    if not success:
      return jsonify({"detail": message}), 400

    meta = otp_service.get_password_reset_meta(email) or {}
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  return jsonify({
    "message": message,
    "email": email,
    "expires_at": meta.get("expires_at"),
    "resend_available_at": meta.get("resend_available_at"),
  }), 200


@app.post("/api/auth/verify-forgot-password-otp")
def verify_forgot_password_otp():
  payload = request.get_json(silent=True) or {}
  email = str(payload.get("email", "")).strip().lower()
  otp = str(payload.get("otp", "")).strip()

  if not email or not otp:
    return jsonify({"detail": "Email and OTP are required."}), 400

  try:
    is_valid, message = otp_service.verify_password_reset_otp(email, otp)
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not is_valid:
    return jsonify({"detail": message}), 400

  return jsonify({"message": message, "email": email}), 200


@app.post("/api/auth/reset-password")
def reset_password():
  payload = request.get_json(silent=True) or {}
  email = str(payload.get("email", "")).strip().lower()
  password = str(payload.get("password", ""))
  confirm_password = str(payload.get("confirm_password", ""))

  if len(email) < 5 or "@" not in email:
    return jsonify({"detail": "Valid email is required."}), 400

  if len(password) < 6:
    return jsonify({"detail": "Password must be at least 6 characters."}), 400

  if password != confirm_password:
    return jsonify({"detail": "Passwords do not match."}), 400

  try:
    user = get_user_by_email(email)
    if not user:
      return jsonify({"detail": "No account found for this email."}), 404

    if not otp_service.is_password_reset_verified(email):
      return jsonify({"detail": "Verify your OTP before changing the password."}), 403

    updated_user = update_user_password(str(user.get("id") or ""), hash_password(password))
    otp_service.clear_password_reset(email)
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not updated_user:
    return jsonify({"detail": "Could not update password."}), 500

  return jsonify({"message": "Password changed successfully."}), 200


@app.get("/api/auth/session")
def auth_session():
  auth_user = session.get("auth_user")
  if not auth_user:
    return jsonify({"authenticated": False, "user": None}), 401

  try:
    user = ensure_bootstrap_admin(get_user_by_email(auth_user["email"]))
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not user:
    session.clear()
    return jsonify({"authenticated": False, "user": None}), 401

  if user.get("role") == "blocked":
    session.clear()
    return jsonify({"authenticated": False, "user": None}), 401

  user_payload = build_user_payload(user)
  store_auth_user(user_payload)
  return jsonify({"authenticated": True, "user": user_payload})


@app.post("/api/auth/logout")
def logout():
  session.clear()
  return jsonify({"message": "Logged out successfully"})


@app.post("/api/practice/developer-access")
def practice_developer_access():
  auth_user, error_response = require_authenticated_user()
  if error_response:
    return error_response

  payload = request.get_json(silent=True) or {}
  username = str(payload.get("username", "")).strip()
  password = str(payload.get("password", ""))

  if not username or not password:
    return jsonify({"detail": "Username and password are required."}), 400

  is_match = username == "saran2511" and password == "Developer2020"

  try:
    updated_user = update_user_page_status(str(auth_user.get("id")), is_match)
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500

  if not updated_user:
    return jsonify({"detail": "Could not update developer access status."}), 500

  user_payload = build_user_payload(updated_user)
  store_auth_user(user_payload)

  if is_match:
    return jsonify({
      "message": "Developer access granted",
      "allowed": True,
      "redirect_url": DEVELOPER_URL,
      "user": user_payload,
    })

  return jsonify({
    "message": "Developer access denied",
    "allowed": False,
    "user": user_payload,
  }), 403


@app.put("/api/user/profile")
def update_profile():
  auth_user = session.get("auth_user")
  if not auth_user:
    return jsonify({"detail": "Not authenticated"}), 401
    
  payload = request.get_json(silent=True) or {}
  name = str(payload.get("name", "")).strip()
  phone = str(payload.get("phone", "")).strip()
  avatar_url = str(payload.get("avatar_url", "")).strip()
  
  if len(name) < 2:
    return jsonify({"detail": "Name must be at least 2 characters."}), 400

  normalized_phone = normalize_phone(phone)
  if len(normalized_phone) != 10:
    return jsonify({"detail": "Mobile number must be exactly 10 digits."}), 400

  if avatar_url and avatar_url not in get_allowed_avatar_paths():
    return jsonify({"detail": "Selected avatar is not allowed."}), 400
    
  try:
    updated_user = update_user_profile(
      auth_user["id"],
      name,
      normalized_phone,
      avatar_url or normalize_avatar_url(auth_user.get("avatar_url")),
    )
    if not updated_user:
      return jsonify({"detail": "Could not update profile."}), 500
      
    user_payload = build_user_payload(updated_user)
    store_auth_user(user_payload)
    
    return jsonify({
      "message": "Profile updated successfully",
      "user": user_payload
    })
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500


@app.post("/api/user/change-password")
def change_password():
  auth_user = session.get("auth_user")
  if not auth_user:
    return jsonify({"detail": "Not authenticated"}), 401
    
  payload = request.get_json(silent=True) or {}
  old_password = str(payload.get("old_password", ""))
  new_password = str(payload.get("new_password", ""))
  
  if len(new_password) < 6:
    return jsonify({"detail": "New password must be at least 6 characters."}), 400
    
  try:
    user = get_user_by_email(auth_user["email"])
    if not user:
      return jsonify({"detail": "User not found"}), 404
      
    if not verify_password(old_password, str(user.get("password_hash", ""))):
      return jsonify({"detail": "Incorrect current password"}), 401
      
    updated_user = update_user_password(auth_user["id"], hash_password(new_password))
    if not updated_user:
      return jsonify({"detail": "Could not update password."}), 500
      
    return jsonify({"message": "Password updated successfully"})
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500


@app.get("/api/admin/users")
def admin_list_users():
  _, error_response = require_admin()
  if error_response:
    return error_response

  try:
    users = [build_user_payload(user) for user in list_users()]
    return jsonify({"users": users})
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500


@app.post("/api/admin/users/<user_id>/action")
def admin_manage_user(user_id: str):
  auth_user, error_response = require_admin()
  if error_response:
    return error_response

  payload = request.get_json(silent=True) or {}
  action = str(payload.get("action", "")).strip().lower()
  admin_password = str(payload.get("password", ""))

  if action not in {"delete", "block", "make_staff", "make_user", "unblock"}:
    return jsonify({"detail": "Invalid admin action"}), 400

  current_admin = ensure_bootstrap_admin(get_user_by_email(str(auth_user.get("email", ""))))
  if not current_admin or not verify_password(admin_password, str(current_admin.get("password_hash", ""))):
    return jsonify({"detail": "Incorrect admin password"}), 401

  target_user = get_user_by_id(user_id)
  if not target_user:
    return jsonify({"detail": "User not found"}), 404

  if str(target_user.get("id")) == str(auth_user.get("id")):
    return jsonify({"detail": "You cannot modify your own admin account from this page"}), 400

  try:
    if action == "delete":
      if not delete_user(user_id):
        return jsonify({"detail": "Could not remove user"}), 500
      return jsonify({"message": f'{target_user.get("email")} removed successfully'})

    if action == "block":
      new_role = "blocked"
    elif action == "unblock":
      new_role = "user"
    elif action == "make_staff":
      new_role = "staff"
    else:
      new_role = "user"
    updated_user = update_user_role(user_id, new_role)
    if not updated_user:
      return jsonify({"detail": "Could not update user role"}), 500

    if action == "block":
      action_label = "blocked"
    elif action == "unblock":
      action_label = "unblocked"
    elif action == "make_staff":
      action_label = "changed to staff"
    else:
      action_label = "changed to user"
    return jsonify({
      "message": f'{updated_user.get("email")} {action_label} successfully',
      "user": build_user_payload(updated_user),
    })
  except Exception as exc:
    return jsonify({"detail": str(exc)}), 500


@app.get("/")
def home_page():
  return serve_page("index.html")


@app.get("/<path:page_name>")
def frontend_page(page_name: str):
  if page_name == "api" or page_name.startswith("api/"):
    abort(404)

  normalized_page = page_name.strip().strip("/")
  if normalized_page in {"developer", "developer.html"} and not can_view_developer_page():
    abort(404)

  try:
    return serve_page(resolve_page_filename(page_name))
  except FileNotFoundError:
    abort(404)


if __name__ == "__main__":
  app.run(host="127.0.0.1", port=8000, debug=True)
