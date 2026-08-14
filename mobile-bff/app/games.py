import os
import requests


GAME_CATALOG_URL = os.getenv(
    "GAME_CATALOG_URL",
    "http://localhost:8081"
)


def get_games():

    print("Mobile BFF -> Game Catalog")

    response = requests.get(
        f"{GAME_CATALOG_URL}/games"
    )

    response.raise_for_status()

    return response.json()


def get_game(game_id):

    print(
        f"Mobile BFF -> Game Catalog: {game_id}"
    )

    response = requests.get(
        f"{GAME_CATALOG_URL}/games/{game_id}"
    )

    response.raise_for_status()

    return response.json()