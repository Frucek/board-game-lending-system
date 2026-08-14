from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import grpc
import requests

from .games import (
    get_games,
    get_game
)

from .users import (
    get_user
)

from .borrowing import (
    borrow_game,
    return_game,
    get_borrowing,
    get_borrowing_history
)

from .serializers import (
    borrowing_to_dict,
    borrowings_to_dict
)


app = FastAPI(
    title="Mobile BFF",
    version="1.0.0",
    description=(
        "Mobile Backend for Frontend "
        "for Board Game Lending System"
    )
)


class BorrowRequest(BaseModel):

    user_id: int
    game_id: int


@app.get("/health")
def health():

    return {
        "service": "mobile-bff",
        "status": "UP"
    }


@app.get("/mobile/games")
def games():

    try:

        return get_games()

    except Exception as error:

        print(
            "Game Catalog error:",
            error
        )

        raise HTTPException(
            status_code=502,
            detail="Game Catalog unavailable"
        )


@app.get("/mobile/games/{game_id}")
def game(game_id: int):

    try:

        return get_game(game_id)

    except Exception as error:

        print(
            "Game Catalog error:",
            error
        )

        if (
            isinstance(error, requests.exceptions.HTTPError)
            and error.response.status_code == 404
        ):
            raise HTTPException(
                status_code=404,
                detail="Game not found"
            )

        raise HTTPException(
            status_code=502,
            detail="Game Catalog unavailable"
        )


@app.get("/mobile/users/{user_id}")
def user(user_id: int):

    try:

        return get_user(user_id)

    except Exception as error:

        print(
            "User Management error:",
            error
        )

        raise HTTPException(
            status_code=502,
            detail="User Management unavailable"
        )


@app.post("/mobile/borrowings")
def borrow(request: BorrowRequest):

    if request.user_id <= 0 or request.game_id <= 0:

        raise HTTPException(
            status_code=400,
            detail=(
                "user_id and game_id "
                "must be positive integers"
            )
        )

    try:

        response = borrow_game(
            request.user_id,
            request.game_id
        )

        return borrowing_to_dict(
            response
        )

    except grpc.RpcError as error:

        print(
            "Borrowing error:",
            error
        )

        if (
            error.code()
            == grpc.StatusCode.INVALID_ARGUMENT
        ):

            raise HTTPException(
                status_code=400,
                detail=error.details()
            )

        raise HTTPException(
            status_code=502,
            detail="Borrowing Service unavailable"
        )


@app.get("/mobile/borrowings/{borrowing_id}")
def borrowing(borrowing_id: int):

    if borrowing_id <= 0:

        raise HTTPException(
            status_code=400,
            detail=(
                "borrowing_id "
                "must be positive"
            )
        )

    try:

        response = get_borrowing(
            borrowing_id
        )

        return borrowing_to_dict(
            response
        )

    except grpc.RpcError as error:

        print(
            "Borrowing error:",
            error
        )

        if (
            error.code()
            == grpc.StatusCode.NOT_FOUND
        ):

            raise HTTPException(
                status_code=404,
                detail=error.details()
            )

        raise HTTPException(
            status_code=502,
            detail="Borrowing Service unavailable"
        )


@app.put(
    "/mobile/borrowings/{borrowing_id}/return"
)
def return_borrowing(
    borrowing_id: int
):

    if borrowing_id <= 0:

        raise HTTPException(
            status_code=400,
            detail=(
                "borrowing_id "
                "must be positive"
            )
        )

    try:

        response = return_game(
            borrowing_id
        )

        return borrowing_to_dict(
            response
        )

    except grpc.RpcError as error:

        print(
            "Borrowing error:",
            error
        )

        if (
            error.code()
            in (
                grpc.StatusCode.NOT_FOUND,
                grpc.StatusCode.INVALID_ARGUMENT
            )
        ):

            raise HTTPException(
                status_code=400
                if error.code()
                == grpc.StatusCode.INVALID_ARGUMENT
                else 404,
                detail=error.details()
            )

        raise HTTPException(
            status_code=502,
            detail="Borrowing Service unavailable"
        )


@app.get(
    "/mobile/users/{user_id}/borrowings"
)
def borrowing_history(user_id: int):

    if user_id <= 0:

        raise HTTPException(
            status_code=400,
            detail=(
                "user_id "
                "must be positive"
            )
        )

    try:

        response = get_borrowing_history(
            user_id
        )

        return {
            "user_id": user_id,
            "borrowings":
                borrowings_to_dict(response)
        }

    except grpc.RpcError as error:

        print(
            "Borrowing error:",
            error
        )

        raise HTTPException(
            status_code=502,
            detail="Borrowing Service unavailable"
        )