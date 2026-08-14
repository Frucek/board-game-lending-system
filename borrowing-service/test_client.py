import grpc

from app.generated import borrowing_pb2
from app.generated import borrowing_pb2_grpc


channel = grpc.insecure_channel("localhost:50051")

stub = borrowing_pb2_grpc.BorrowingServiceStub(channel)


# Borrow a game
print("Borrowing game...")

borrowing = stub.BorrowGame(
    borrowing_pb2.BorrowGameRequest(
        user_id=1,
        game_id=10
    )
)

print(borrowing)


# Get borrowing history
print("Getting history...")

history = stub.GetBorrowingHistory(
    borrowing_pb2.GetBorrowingHistoryRequest(
        user_id=1
    )
)

print(history)


# Return the game
print("Returning game...")

returned = stub.ReturnGame(
    borrowing_pb2.ReturnGameRequest(
        borrowing_id=borrowing.id
    )
)

print(returned)