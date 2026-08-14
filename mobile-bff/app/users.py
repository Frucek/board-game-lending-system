import os
import requests


USER_SERVICE_URL = os.getenv(
    "USER_SERVICE_URL",
    "http://localhost:3000"
)


def get_user(user_id):

    print(
        f"Mobile BFF -> User Management: {user_id}"
    )

    response = requests.get(
        f"{USER_SERVICE_URL}/users/{user_id}"
    )

    response.raise_for_status()

    return response.json()