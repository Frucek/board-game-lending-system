const request = require("supertest");

jest.mock("../src/gameCatalogClient");
jest.mock("../src/userClient");
jest.mock("../src/borrowingClient");

const gameClient =
    require("../src/gameCatalogClient");

const userClient =
    require("../src/userClient");

const borrowingClient =
    require("../src/borrowingClient");

const app =
    require("../src/app");


describe("Web BFF", () => {

    beforeEach(() => {

        jest.clearAllMocks();
    });


    test("GET /health", async () => {

        const response =
            await request(app)
                .get("/health");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toEqual({
                service: "web-bff",
                status: "UP"
            });
    });


    test("GET /games", async () => {

        gameClient.getGames.mockResolvedValue([
            {
                id: 1,
                name: "Catan"
            }
        ]);

        const response =
            await request(app)
                .get("/games");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toEqual([
                {
                    id: 1,
                    name: "Catan"
                }
            ]);
    });


    test("GET /games/:id", async () => {

        gameClient.getGame.mockResolvedValue({
            id: 1,
            name: "Catan"
        });

        const response =
            await request(app)
                .get("/games/1");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.id)
            .toBe(1);

        expect(
            gameClient.getGame
        ).toHaveBeenCalledWith("1");
    });


    test("POST /games", async () => {

        gameClient.createGame.mockResolvedValue({
            id: 1,
            name: "Catan"
        });

        const response =
            await request(app)
                .post("/games")
                .send({
                    name: "Catan",
                    category: "Strategy",
                    minPlayers: 3,
                    maxPlayers: 4,
                    difficulty: "MEDIUM"
                });

        expect(response.statusCode)
            .toBe(201);

        expect(response.body.name)
            .toBe("Catan");
    });


    test("PUT /games/:id", async () => {

        gameClient.updateGame.mockResolvedValue({
            id: 1,
            name: "Catan Updated"
        });

        const response =
            await request(app)
                .put("/games/1")
                .send({
                    name: "Catan Updated",
                    category: "Strategy",
                    minPlayers: 3,
                    maxPlayers: 4,
                    difficulty: "MEDIUM"
                });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.name)
            .toBe("Catan Updated");
    });


    test("DELETE /games/:id", async () => {

        gameClient.deleteGame.mockResolvedValue();

        const response =
            await request(app)
                .delete("/games/1");

        expect(response.statusCode)
            .toBe(204);
    });


    test("GET /users", async () => {

        userClient.getUsers.mockResolvedValue([
            {
                id: 1,
                name: "John"
            }
        ]);

        const response =
            await request(app)
                .get("/users");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toHaveLength(1);
    });


    test("GET /users/:id", async () => {

        userClient.getUser.mockResolvedValue({
            id: 1,
            name: "John"
        });

        const response =
            await request(app)
                .get("/users/1");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.id)
            .toBe(1);
    });


    test("POST /users", async () => {

        userClient.createUser.mockResolvedValue({
            id: 1,
            name: "John",
            email: "john@test.com"
        });

        const response =
            await request(app)
                .post("/users")
                .send({
                    name: "John",
                    email: "john@test.com"
                });

        expect(response.statusCode)
            .toBe(201);

        expect(response.body.name)
            .toBe("John");
    });


    test("PUT /users/:id/status", async () => {

        userClient.updateUserStatus
            .mockResolvedValue({
                id: 1,
                status: "SUSPENDED"
            });

        const response =
            await request(app)
                .put("/users/1/status")
                .send({
                    status: "SUSPENDED"
                });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.status)
            .toBe("SUSPENDED");
    });


    test("DELETE /users/:id", async () => {

        userClient.deleteUser.mockResolvedValue();

        const response =
            await request(app)
                .delete("/users/1");

        expect(response.statusCode)
            .toBe(204);
    });


    test("POST /borrowings", async () => {

        borrowingClient.borrowGame
            .mockResolvedValue({
                id: 10,
                user_id: 1,
                game_id: 5,
                status: 1
            });

        const response =
            await request(app)
                .post("/borrowings")
                .send({
                    user_id: 1,
                    game_id: 5
                });

        expect(response.statusCode)
            .toBe(201);

        expect(response.body.id)
            .toBe(10);
    });


    test("GET /borrowings/:id", async () => {

        borrowingClient.getBorrowing
            .mockResolvedValue({
                id: 10,
                user_id: 1,
                game_id: 5
            });

        const response =
            await request(app)
                .get("/borrowings/10");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.id)
            .toBe(10);
    });


    test("PUT /borrowings/:id/return", async () => {

        borrowingClient.returnGame
            .mockResolvedValue({
                id: 10,
                status: 2
            });

        const response =
            await request(app)
                .put("/borrowings/10/return");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.id)
            .toBe(10);
    });


    test("GET /users/:id/borrowings", async () => {

        borrowingClient
            .getBorrowingHistory
            .mockResolvedValue({
                borrowings: [
                    {
                        id: 10,
                        user_id: 1,
                        game_id: 5
                    }
                ]
            });

        const response =
            await request(app)
                .get("/users/1/borrowings");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.user_id)
            .toBe(1);

        expect(
            response.body.borrowings
        ).toHaveLength(1);
    });


    test("invalid game id returns 400", async () => {

        const response =
            await request(app)
                .get("/games/abc");

        expect(response.statusCode)
            .toBe(400);
    });


    test("invalid user id returns 400", async () => {

        const response =
            await request(app)
                .get("/users/abc");

        expect(response.statusCode)
            .toBe(400);
    });


    test("invalid borrowing request returns 400", async () => {

        const response =
            await request(app)
                .post("/borrowings")
                .send({
                    user_id: -1,
                    game_id: 5
                });

        expect(response.statusCode)
            .toBe(400);
    });

});