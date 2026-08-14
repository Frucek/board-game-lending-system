def borrowing_to_dict(borrowing):

    status_map = {
        0: "UNSPECIFIED",
        1: "BORROWED",
        2: "RETURNED"
    }

    return {
        "id": borrowing.id,
        "user_id": borrowing.user_id,
        "game_id": borrowing.game_id,
        "borrowed_at": borrowing.borrowed_at,
        "returned_at": borrowing.returned_at,
        "status": status_map.get(
            borrowing.status,
            "UNSPECIFIED"
        )
    }


def borrowings_to_dict(response):

    return [
        borrowing_to_dict(
            borrowing
        )
        for borrowing in response.borrowings
    ]