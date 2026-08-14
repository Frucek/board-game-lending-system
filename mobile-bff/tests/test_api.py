from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():

    response = client.get(
        "/health"
    )

    assert response.status_code == 200

    assert response.json() == {
        "service": "mobile-bff",
        "status": "UP"
    }


@patch("app.main.get_games")
def test_get_games(mock_get_games):

    mock_get_games.return_value = [
        {
            "id": 1,
            "name": "Catan"
        }
    ]

    response = client.get(
        "/mobile/games"
    )

    assert response.status_code == 200

    assert response.json() == [
        {
            "id": 1,
            "name": "Catan"
        }
    ]


@patch("app.main.get_game")
def test_get_game(mock_get_game):

    mock_get_game.return_value = {
        "id": 1,
        "name": "Catan"
    }

    response = client.get(
        "/mobile/games/1"
    )

    assert response.status_code == 200

    assert response.json()["id"] == 1


@patch("app.main.get_user")
def test_get_user(mock_get_user):

    mock_get_user.return_value = {
        "id": 1,
        "name": "John",
        "email": "john@test.com",
        "status": "ACTIVE",
        "borrowing_limit": 3
    }

    response = client.get(
        "/mobile/users/1"
    )

    assert response.status_code == 200

    assert response.json()["id"] == 1


@patch("app.main.borrow_game")
def test_borrow_game(mock_borrow_game):

    mock_response = type(
        "Borrowing",
        (),
        {
            "id": 10,
            "user_id": 1,
            "game_id": 5,
            "borrowed_at": "2026-08-14T10:00:00Z",
            "returned_at": "",
            "status": 1
        }
    )()

    mock_borrow_game.return_value = mock_response

    response = client.post(
        "/mobile/borrowings",
        json={
            "user_id": 1,
            "game_id": 5
        }
    )

    assert response.status_code == 200

    body = response.json()

    assert body["id"] == 10
    assert body["user_id"] == 1
    assert body["game_id"] == 5
    assert body["status"] == "BORROWED"


@patch("app.main.get_borrowing")
def test_get_borrowing(mock_get_borrowing):

    mock_response = type(
        "Borrowing",
        (),
        {
            "id": 10,
            "user_id": 1,
            "game_id": 5,
            "borrowed_at": "2026-08-14T10:00:00Z",
            "returned_at": "",
            "status": 1
        }
    )()

    mock_get_borrowing.return_value = mock_response

    response = client.get(
        "/mobile/borrowings/10"
    )

    assert response.status_code == 200

    assert response.json()["id"] == 10


@patch("app.main.return_game")
def test_return_game(mock_return_game):

    mock_response = type(
        "Borrowing",
        (),
        {
            "id": 10,
            "user_id": 1,
            "game_id": 5,
            "borrowed_at": "2026-08-14T10:00:00Z",
            "returned_at": "2026-08-15T10:00:00Z",
            "status": 2
        }
    )()

    mock_return_game.return_value = mock_response

    response = client.put(
        "/mobile/borrowings/10/return"
    )

    assert response.status_code == 200

    assert response.json()["status"] == "RETURNED"


@patch("app.main.get_borrowing_history")
def test_borrowing_history(
    mock_get_borrowing_history
):

    borrowing = type(
        "Borrowing",
        (),
        {
            "id": 10,
            "user_id": 1,
            "game_id": 5,
            "borrowed_at": "2026-08-14T10:00:00Z",
            "returned_at": "",
            "status": 1
        }
    )()

    mock_response = type(
        "History",
        (),
        {
            "borrowings": [borrowing]
        }
    )()

    mock_get_borrowing_history.return_value = (
        mock_response
    )

    response = client.get(
        "/mobile/users/1/borrowings"
    )

    assert response.status_code == 200

    body = response.json()

    assert body["user_id"] == 1
    assert len(body["borrowings"]) == 1
    assert body["borrowings"][0]["id"] == 10