from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sqlite3, os, json
from datetime import datetime

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "deborasaurus.db")
_data_dir = os.path.dirname(DB_PATH)
os.makedirs(_data_dir, exist_ok=True)
# Ensure the data directory is group-writable so the platform backend can write
try:
    os.chmod(_data_dir, 0o775)
except Exception:
    pass

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS guestbook (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_name TEXT NOT NULL,
            message TEXT NOT NULL,
            dino_emoji TEXT DEFAULT '🦕',
            created_at TEXT NOT NULL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS mystery_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_key TEXT NOT NULL,
            answer TEXT NOT NULL,
            visitor_name TEXT,
            created_at TEXT NOT NULL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS identity_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            option_text TEXT NOT NULL,
            visitor_name TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()
# Ensure DB file is group-writable after creation
try:
    os.chmod(DB_PATH, 0o664)
except Exception:
    pass

# ── Guestbook ──────────────────────────────────────────────
class GuestbookEntry(BaseModel):
    visitor_name: str
    message: str
    dino_emoji: Optional[str] = "🦕"

@router.get("/guestbook")
def get_guestbook():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM guestbook ORDER BY created_at DESC LIMIT 50"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/guestbook")
def add_guestbook(entry: GuestbookEntry):
    if not entry.visitor_name.strip() or not entry.message.strip():
        raise HTTPException(400, "Name and message required")
    if len(entry.message) > 500:
        raise HTTPException(400, "Message too long (max 500 chars)")
    conn = get_db()
    conn.execute(
        "INSERT INTO guestbook (visitor_name, message, dino_emoji, created_at) VALUES (?,?,?,?)",
        (entry.visitor_name.strip()[:80], entry.message.strip(), entry.dino_emoji or "🦕", datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
    return {"ok": True}
