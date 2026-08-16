import sqlite3
from pathlib import Path


DATABASE_DIR = Path("/data")
DATABASE_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = DATABASE_DIR / "borrowings.db"

def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS borrowings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            borrowed_at TEXT NOT NULL,
            returned_at TEXT,
            status TEXT NOT NULL
                CHECK (status IN ('BORROWED', 'RETURNED'))
        )
        """
    )

    connection.commit()
    connection.close()