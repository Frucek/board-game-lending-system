## Game Catalog Service

Prva implementirana mikrostoritev je Game Catalog Service.

### Funkcionalnosti

- pregled vseh družabnih iger
- pregled posamezne igre
- dodajanje igre
- urejanje igre
- brisanje igre

### Tehnologije

- Java 21
- Spring Boot
- Spring WebFlux
- PostgreSQL
- R2DBC
- OpenAPI / Swagger
- Docker
- JUnit

### API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/games` | Get all games |
| GET | `/games/{id}` | Get game |
| POST | `/games` | Create game |
| PUT | `/games/{id}` | Update game |
| DELETE | `/games/{id}` | Delete game |

