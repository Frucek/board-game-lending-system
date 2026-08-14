import os
import grpc

from . import borrowing_pb2
from . import borrowing_pb2_grpc


BORROWING_URL = os.getenv(
    "BORROWING_URL",
    "localhost:50051"
)


def get_borrowing_history(user_id):

    print(
        f"Mobile BFF -> Borrowing: history {user_id}"
    )

    channel = grpc.insecure_channel(
        BORROWING_URL
    )

    client = borrowing_pb2_grpc.BorrowingServiceStub(
        channel
    )

    request = borrowing_pb2.GetBorrowingHistoryRequest(
        user_id=int(user_id)
    )

    response = client.GetBorrowingHistory(
        request
    )

    return response