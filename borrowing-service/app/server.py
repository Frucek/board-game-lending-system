import logging
from concurrent import futures

import grpc

from .database import initialize_database
from .service import BorrowingService
from .generated import borrowing_pb2
from .generated import borrowing_pb2_grpc
from .models import BorrowingStatus


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


class BorrowingGrpcService(
    borrowing_pb2_grpc.BorrowingServiceServicer
):

    def __init__(self):
        self.service = BorrowingService()

    def BorrowGame(self, request, context):

        try:
            borrowing = self.service.borrow_game(
                request.user_id,
                request.game_id
            )

            return self._to_response(borrowing)

        except ValueError as error:

            context.abort(
                grpc.StatusCode.INVALID_ARGUMENT,
                str(error)
            )

    def ReturnGame(self, request, context):

        try:
            borrowing = self.service.return_game(
                request.borrowing_id
            )

            return self._to_response(borrowing)

        except ValueError as error:

            context.abort(
                grpc.StatusCode.NOT_FOUND,
                str(error)
            )

    def GetBorrowingHistory(self, request, context):

        borrowings = self.service.get_borrowing_history(
            request.user_id
        )

        return borrowing_pb2.BorrowingHistoryResponse(
            borrowings=[
                self._to_response(borrowing)
                for borrowing in borrowings
            ]
        )

    def GetBorrowing(self, request, context):

        try:
            borrowing = self.service.get_borrowing(
                request.borrowing_id
            )

            return self._to_response(borrowing)

        except ValueError as error:

            context.abort(
                grpc.StatusCode.NOT_FOUND,
                str(error)
            )


    @staticmethod
    def _to_proto_status(status: BorrowingStatus) -> int:

        status_map = {
            BorrowingStatus.BORROWED:
                borrowing_pb2.BORROWING_STATUS_BORROWED,

            BorrowingStatus.RETURNED:
                borrowing_pb2.BORROWING_STATUS_RETURNED,
        }
        return status_map[status]


    @staticmethod
    def _to_response(borrowing):
        return borrowing_pb2.BorrowingResponse(
            id=borrowing.id,
            user_id=borrowing.user_id,
            game_id=borrowing.game_id,
            borrowed_at=borrowing.borrowed_at,
            returned_at=borrowing.returned_at or "",
            status=BorrowingGrpcService._to_proto_status(
            borrowing.status
            )
        )


def serve():

    initialize_database()

    server = grpc.server(
        futures.ThreadPoolExecutor(
            max_workers=10
        )
    )

    borrowing_pb2_grpc.add_BorrowingServiceServicer_to_server(
        BorrowingGrpcService(),
        server
    )

    server.add_insecure_port(
        "[::]:50051"
    )

    server.start()

    logger.info(
        "Borrowing Service started on port 50051"
    )

    server.wait_for_termination()


if __name__ == "__main__":
    serve()