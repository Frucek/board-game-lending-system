Web BFF and Mobile BFF are separate gateways.

They use different technologies:
- Web BFF: Node.js + Express
- Mobile BFF: Python + FastAPI

They expose different API paths tailored to their clients.


Web BFF

GET    /games
GET    /games/:id
POST   /games
PUT    /games/:id
DELETE /games/:id

GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id/status
DELETE /users/:id

POST   /borrowings
GET    /borrowings/:id
PUT    /borrowings/:id/return
GET    /users/:id/borrowings




Mobile BFF

GET    /mobile/games
GET    /mobile/games/:game_id

GET    /mobile/users/:user_id

POST   /mobile/borrowings
GET    /mobile/borrowings/:borrowing_id
PUT    /mobile/borrowings/:borrowing_id/return
GET    /mobile/users/:user_id/borrowings