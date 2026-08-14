from dataclasses import dataclass
from enum import Enum
from typing import Optional


class BorrowingStatus(Enum):
    BORROWED = "BORROWED"
    RETURNED = "RETURNED"

@dataclass
class Borrowing:
    id: int
    user_id: int
    game_id: int
    borrowed_at: str
    returned_at: Optional[str]
    status: BorrowingStatus
