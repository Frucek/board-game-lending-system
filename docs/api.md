# API Specification

## Game Catalog Service

### Get all games

GET /games

### Get game

GET /games/{id}

### Create game

POST /games

### Update game

PUT /games/{id}

### Delete game

DELETE /games/{id}


## Borrowing Service

### Borrow game

POST /borrowings

### Return game

PUT /borrowings/{id}/return

### Get borrowings

GET /borrowings


## User Management Service

### Get users

GET /users

### Get user

GET /users/{id}

### Create user

POST /users

### Update user

PUT /users/{id}