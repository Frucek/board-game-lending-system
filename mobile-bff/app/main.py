from fastapi import FastAPI, HTTPException

from .games import get_games, get_game
from .users import get_user
from .borrowing import get_borrowing_history


app = FastAPI(
    title="Mobile BFF",
    version="1.0.0",
    description="Mobile Backend for Frontend"
)


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

        print(error)

        raise HTTPException(
            status_code=502,
            detail="Game Catalog unavailable"
        )


@app.get("/mobile/games/{game_id}")
def game(game_id: int):

    try:

        return get_game(game_id)

    except Exception as error:

        print(error)

        raise HTTPException(
            status_code=502,
            detail="Game Catalog unavailable"
        )


@app.get("/mobile/users/{user_id}")
def user(user_id: int):

    try:

        return get_user(user_id)

    except Exception as error:

        print(error)

        raise HTTPException(
            status_code=502,
            detail="User Management unavailable"
        )


@app.get("/mobile/users/{user_id}/borrowings")
def borrowing_history(user_id: int):

    try:

        response = get_borrowing_history(
            user_id
        )

        return {
            "user_id": user_id,
            "borrowings": [
                str(item)
                for item in response.borrowings
            ]
        }

    except Exception as error:

        print(error)

        raise HTTPException(
            status_code=502,
            detail="Borrowing Service unavailable"
        )