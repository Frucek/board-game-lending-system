import os
import tempfile
import unittest

from app import database
from app.service import BorrowingService
from app.models import BorrowingStatus


class BorrowingServiceTest(unittest.TestCase):

    def setUp(self):

        self.temp_database = tempfile.NamedTemporaryFile(
            suffix=".db",
            delete=False
        )

        self.temp_database.close()

        database.DATABASE_PATH = self.temp_database.name

        database.initialize_database()

        self.service = BorrowingService()

    def tearDown(self):

        os.unlink(
            self.temp_database.name
        )

    def test_borrow_game(self):

        borrowing = self.service.borrow_game(
            user_id=1,
            game_id=10
        )

        self.assertEqual(
            borrowing.user_id,
            1
        )

        self.assertEqual(
            borrowing.game_id,
            10
        )

        self.assertIsInstance(
            borrowing.status,
            BorrowingStatus
        )

        self.assertEqual(
            borrowing.status,
            BorrowingStatus.BORROWED
        )

        self.assertIsNone(
            borrowing.returned_at
        )

    def test_return_game(self):

        borrowing = self.service.borrow_game(
            user_id=1,
            game_id=10
        )

        returned = self.service.return_game(
            borrowing.id
        )

        self.assertIsInstance(
            borrowing.status,
            BorrowingStatus
        )

        self.assertEqual(
            returned.status,
            BorrowingStatus.RETURNED
        )

        self.assertIsNotNone(
            returned.returned_at
        )

    def test_get_borrowing_history(self):

        self.service.borrow_game(
            user_id=1,
            game_id=10
        )

        self.service.borrow_game(
            user_id=1,
            game_id=20
        )

        history = self.service.get_borrowing_history(
            user_id=1
        )

        self.assertEqual(
            len(history),
            2
        )

    def test_get_borrowing(self):

        borrowing = self.service.borrow_game(
            user_id=1,
            game_id=10
        )

        found = self.service.get_borrowing(
            borrowing.id
        )

        self.assertEqual(
            found.id,
            borrowing.id
        )

    def test_cannot_borrow_same_game_twice(self):

        self.service.borrow_game(
            user_id=1,
            game_id=10
        )

        with self.assertRaises(ValueError):

            self.service.borrow_game(
                user_id=1,
                game_id=10
            )


if __name__ == "__main__":
    unittest.main()