import os
import tempfile
import threading
import unittest
from concurrent import futures

import grpc

from app import database
from app.server import BorrowingGrpcService
from app.generated import borrowing_pb2
from app.generated import borrowing_pb2_grpc


class GrpcTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):

        cls.temp_database = tempfile.NamedTemporaryFile(
            suffix=".db",
            delete=False
        )

        cls.temp_database.close()

        database.DATABASE_PATH = cls.temp_database.name
        database.initialize_database()

        cls.server = grpc.server(
            futures.ThreadPoolExecutor(
                max_workers=4
            )
        )

        borrowing_pb2_grpc.add_BorrowingServiceServicer_to_server(
            BorrowingGrpcService(),
            cls.server
        )

        port = cls.server.add_insecure_port(
            "localhost:0"
        )

        cls.server.start()

        cls.channel = grpc.insecure_channel(
            f"localhost:{port}"
        )

        cls.stub = borrowing_pb2_grpc.BorrowingServiceStub(
            cls.channel
        )

    @classmethod
    def tearDownClass(cls):

        cls.channel.close()

        cls.server.stop(0)

        os.unlink(
            cls.temp_database.name
        )

    def test_borrow_game(self):

        response = self.stub.BorrowGame(
            borrowing_pb2.BorrowGameRequest(
                user_id=1,
                game_id=100
            )
        )

        self.assertEqual(
            response.user_id,
            1
        )

        self.assertEqual(
            response.game_id,
            100
        )

        self.assertEqual(
            response.status,
            borrowing_pb2.BORROWING_STATUS_BORROWED
        )

    def test_get_history(self):

        self.stub.BorrowGame(
            borrowing_pb2.BorrowGameRequest(
                user_id=2,
                game_id=200
            )
        )

        response = self.stub.GetBorrowingHistory(
            borrowing_pb2.GetBorrowingHistoryRequest(
                user_id=2
            )
        )

        self.assertGreaterEqual(
            len(response.borrowings),
            1
        )

    def test_return_game(self):

        borrowing = self.stub.BorrowGame(
            borrowing_pb2.BorrowGameRequest(
                user_id=3,
                game_id=300
            )
        )

        response = self.stub.ReturnGame(
            borrowing_pb2.ReturnGameRequest(
                borrowing_id=borrowing.id
            )
        )

        self.assertEqual(
            response.status,
            borrowing_pb2.BORROWING_STATUS_RETURNED
        )


if __name__ == "__main__":
    unittest.main()