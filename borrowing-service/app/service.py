import logging
from datetime import datetime, timezone

from .database import get_connection
from .models import Borrowing, BorrowingStatus


logger = logging.getLogger(__name__)


class BorrowingService:

    def borrow_game(self, user_id: int, game_id: int) -> Borrowing:

        logger.info(
            "Borrowing game: user_id=%s game_id=%s",
            user_id,
            game_id
        )

        connection = get_connection()

        # Check if the user already has this game borrowed
        existing = connection.execute(
            """
            SELECT *
            FROM borrowings
            WHERE user_id = ?
              AND game_id = ?
              AND status = ?
            """,
            (user_id, game_id, BorrowingStatus.BORROWED.value)
        ).fetchone()

        if existing:
            connection.close()

            raise ValueError(
                "User already has this game borrowed"
            )

        borrowed_at = datetime.now(
            timezone.utc
        ).isoformat()

        cursor = connection.execute(
            """
            INSERT INTO borrowings
            (
                user_id,
                game_id,
                borrowed_at,
                status
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                user_id,
                game_id,
                borrowed_at,
                BorrowingStatus.BORROWED.value
            )
        )

        connection.commit()

        borrowing_id = cursor.lastrowid

        row = connection.execute(
            """
            SELECT *
            FROM borrowings
            WHERE id = ?
            """,
            (borrowing_id,)
        ).fetchone()

        connection.close()

        return self._row_to_borrowing(row)

    def return_game(self, borrowing_id: int) -> Borrowing:

        logger.info(
            "Returning borrowing id=%s",
            borrowing_id
        )

        connection = get_connection()

        row = connection.execute(
            """
            SELECT *
            FROM borrowings
            WHERE id = ?
            """,
            (borrowing_id,)
        ).fetchone()

        if row is None:
            connection.close()
            raise ValueError("Borrowing not found")

        if row["status"] == BorrowingStatus.RETURNED.value:
            connection.close()
            raise ValueError("Game has already been returned")

        returned_at = datetime.now(
            timezone.utc
        ).isoformat()

        connection.execute(
            """
            UPDATE borrowings
            SET returned_at = ?,
                status = ?
            WHERE id = ?
            """,
            (
                returned_at,
                BorrowingStatus.RETURNED.value,
                borrowing_id
            )
        )

        connection.commit()

        updated = connection.execute(
            """
            SELECT *
            FROM borrowings
            WHERE id = ?
            """,
            (borrowing_id,)
        ).fetchone()

        connection.close()

        return self._row_to_borrowing(updated)

    def get_borrowing_history(
        self,
        user_id: int
    ) -> list[Borrowing]:

        logger.info(
            "Getting borrowing history for user_id=%s",
            user_id
        )

        connection = get_connection()

        rows = connection.execute(
            """
            SELECT *
            FROM borrowings
            WHERE user_id = ?
            ORDER BY id DESC
            """,
            (user_id,)
        ).fetchall()

        connection.close()

        return [
            self._row_to_borrowing(row)
            for row in rows
        ]

    def get_borrowing(
        self,
        borrowing_id: int
    ) -> Borrowing:

        logger.info(
            "Getting borrowing id=%s",
            borrowing_id
        )

        connection = get_connection()

        row = connection.execute(
            """
            SELECT *
            FROM borrowings
            WHERE id = ?
            """,
            (borrowing_id,)
        ).fetchone()

        connection.close()

        if row is None:
            raise ValueError("Borrowing not found")

        return self._row_to_borrowing(row)

    @staticmethod
    def _row_to_borrowing(row) -> Borrowing:
        return Borrowing(
            id=row["id"],
            user_id=row["user_id"],
            game_id=row["game_id"],
            borrowed_at=row["borrowed_at"],
            returned_at=row["returned_at"],
            status=BorrowingStatus(row["status"])
        )