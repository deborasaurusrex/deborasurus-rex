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

# ── Mystery fill-in-the-blank ──────────────────────────────
MYSTERY_QUESTIONS = [
    {"key": "superpower", "prompt": "If Kate could have one superpower it would be…"},
    {"key": "snack",      "prompt": "Kate's late-night snack of choice is…"},
    {"key": "villain",    "prompt": "If Kate were a dino villain her name would be…"},
    {"key": "hobby",      "prompt": "Kate's secret hobby no one knows about is…"},
    {"key": "planet",     "prompt": "If Kate ruled a planet it would be called…"},
]

class MysteryAnswer(BaseModel):
    question_key: str
    answer: str
    visitor_name: Optional[str] = "Anonymous"

@router.get("/mystery")
def get_mystery():
    conn = get_db()
    results = {}
    for q in MYSTERY_QUESTIONS:
        rows = conn.execute(
            "SELECT answer, visitor_name, created_at FROM mystery_answers WHERE question_key=? ORDER BY created_at DESC LIMIT 20",
            (q["key"],)
        ).fetchall()
        results[q["key"]] = {"prompt": q["prompt"], "answers": [dict(r) for r in rows]}
    conn.close()
    return results

@router.post("/mystery")
def add_mystery(data: MysteryAnswer):
    valid_keys = {q["key"] for q in MYSTERY_QUESTIONS}
    if data.question_key not in valid_keys:
        raise HTTPException(400, "Unknown question")
    if not data.answer.strip():
        raise HTTPException(400, "Answer required")
    conn = get_db()
    conn.execute(
        "INSERT INTO mystery_answers (question_key, answer, visitor_name, created_at) VALUES (?,?,?,?)",
        (data.question_key, data.answer.strip()[:200], (data.visitor_name or "Anonymous").strip()[:80], datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
    return {"ok": True}

# ── Identity votes ─────────────────────────────────────────
IDENTITY_CATEGORIES = [
    {"key": "vibe",    "label": "Kate's vibe is…"},
    {"key": "era",     "label": "Kate belongs in which era…"},
    {"key": "element", "label": "Kate's element is…"},
]

class IdentityVote(BaseModel):
    category: str
    option_text: str
    visitor_name: Optional[str] = "Anonymous"

@router.get("/identity")
def get_identity():
    conn = get_db()
    results = {}
    for cat in IDENTITY_CATEGORIES:
        rows = conn.execute(
            """SELECT option_text, COUNT(*) as votes
               FROM identity_votes WHERE category=?
               GROUP BY option_text ORDER BY votes DESC LIMIT 20""",
            (cat["key"],)
        ).fetchall()
        results[cat["key"]] = {"label": cat["label"], "options": [dict(r) for r in rows]}
    conn.close()
    return results

@router.post("/identity")
def add_identity(data: IdentityVote):
    valid_keys = {c["key"] for c in IDENTITY_CATEGORIES}
    if data.category not in valid_keys:
        raise HTTPException(400, "Unknown category")
    if not data.option_text.strip():
        raise HTTPException(400, "Option required")
    conn = get_db()
    conn.execute(
        "INSERT INTO identity_votes (category, option_text, visitor_name, created_at) VALUES (?,?,?,?)",
        (data.category, data.option_text.strip()[:100], (data.visitor_name or "Anonymous").strip()[:80], datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
    return {"ok": True}
