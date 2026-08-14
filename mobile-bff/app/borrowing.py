import os

import grpc

from . import borrowing_pb2
from . import borrowing_pb2_grpc


BORROWING_URL = os.getenv(
    "BORROWING_URL",
    "localhost:50051"
)


def _client():

    channel = grpc.insecure_channel(
        BORROWING_URL
    )

    return borrowing_pb2_grpc.BorrowingServiceStub(
        channel
    )


def borrow_game(user_id, game_id):

    print(
        f"Mobile BFF -> Borrowing: "
        f"borrow user={user_id}, game={game_id}"
    )

    client = _client()

    request = borrowing_pb2.BorrowGameRequest(
        user_id=int(user_id),
        game_id=int(game_id)
    )

    return client.BorrowGame(request)


def return_game(borrowing_id):

    print(
        f"Mobile BFF -> Borrowing: "
        f"return {borrowing_id}"
    )

    client = _client()

    request = borrowing_pb2.ReturnGameRequest(
        borrowing_id=int(borrowing_id)
    )

    return client.ReturnGame(request)


def get_borrowing(borrowing_id):

    print(
        f"Mobile BFF -> Borrowing: "
        f"get {borrowing_id}"
    )

    client = _client()

    request = borrowing_pb2.GetBorrowingRequest(
        borrowing_id=int(borrowing_id)
    )

    return client.GetBorrowing(request)


def get_borrowing_history(user_id):

    print(
        f"Mobile BFF -> Borrowing: "
        f"history {user_id}"
    )

    client = _client()

    request = borrowing_pb2.GetBorrowingHistoryRequest(
        user_id=int(user_id)
    )

    return client.GetBorrowingHistory(request)