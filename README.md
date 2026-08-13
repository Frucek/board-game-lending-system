# Board Game Lending System

# Board Game Lending System

1. Opis projekta
2. Glavne funkcionalnosti
3. Mikrostoritve
4. Arhitektura sistema
5. Komunikacija med storitvami
6. Tehnologije
7. Struktura repozitorija
8. API


## Opis projekta

Board Game Lending System je mikrostoritveni sistem za izposojo družabnih iger.

Uporabnikom omogoča pregled družabnih iger, preverjanje njihove razpoložljivosti, izposojo in vračilo iger prek spletne aplikacije.

## Glavne funkcionalnosti

- pregled družabnih iger
- pregled podrobnosti igre
- preverjanje razpoložljivosti
- izposoja igre
- vračilo igre
- pregled zgodovine izposoj
- upravljanje uporabnikov


## Mikrostoritve

### Game Catalog Service

Skrbi za upravljanje družabnih iger, kategorij, števila igralcev, težavnosti in razpoložljivosti.

### Borrowing Service

Skrbi za izposojo, vračilo in zgodovino izposoj družabnih iger.

### User Management Service

Skrbi za uporabnike, njihov status in omejitve izposoje.

### Web UI

Spletna aplikacija, prek katere uporabnik dostopa do sistema.


## Lastništvo podatkov

| Storitev | Podatki |
|---|---|
| Game Catalog | Igre, kategorije, težavnost, število igralcev |
| Borrowing | Izposoje, vračila, zgodovina |
| User Management | Uporabniki, status, omejitve izposoje |




| Component        | Technology         |
| ---------------- | ------------------ |
| Game Catalog     | Java + Spring Boot |
| Borrowing        | Python + gRPC      |
| User Management  | Node.js + NestJS   |
| Web UI           | React + TypeScript |
| Databases        | PostgreSQL         |
| Containerization | Docker             |


                 Web UI
                   |
          ┌────────┼────────┐
          |        |        |
        REST     REST     REST
          ↓        ↓        ↓
       Catalog  Borrowing  Users
                  |   |
                REST gRPC
                  ↓   ↓
               Catalog Users



flowchart TD

    User[User]

    Web[Web UI<br/>React + TypeScript]

    Catalog[Game Catalog Service<br/>Java + Spring Boot]
    Borrowing[Borrowing Service<br/>Python + gRPC]
    Users[User Management Service<br/>Node.js + NestJS]

    CatalogDB[(Game Catalog DB)]
    BorrowingDB[(Borrowing DB)]
    UsersDB[(User DB)]

    User --> Web

    Web -->|REST| Catalog
    Web -->|REST| Borrowing
    Web -->|REST| Users

    Borrowing -->|REST| Catalog
    Borrowing -->|gRPC| Users

    Catalog --> CatalogDB
    Borrowing --> BorrowingDB
    Users --> UsersDB




## Struktura repozitorija

    board-game-lending-system/
    ├── README.md
    ├── .gitignore
    ├── docs/
    ├── game-catalog-service/
    ├── borrowing-service/
    ├── user-management-service/
    └── web-ui/