const request = require("supertest");

const app = require("../src/app");
const database = require("../src/database");

beforeAll(() => {
    return new Promise((resolve, reject) => {
        database.database.run(
            `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL,
                borrowing_limit INTEGER NOT NULL
            )
            `,
            error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
});

beforeEach(() => {
    return new Promise((resolve, reject) => {
        database.database.run(
            "DELETE FROM users",
            error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
});

afterAll(() => {
    database.database.close();
});

describe("User Management API", () => {

    test("GET /users", async () => {
        const response = await request(app)
            .get("/users");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test("POST /users", async () => {
        const response = await request(app)
            .post("/users")
            .send({
                name: "John",
                email: "john@test.com"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe("John");
        expect(response.body.status).toBe("ACTIVE");
        expect(response.body.borrowingLimit).toBe(3);
    });

    test("GET /users/:id", async () => {
        const created = await request(app)
            .post("/users")
            .send({
                name: "John",
                email: "john2@test.com"
            });

        const response = await request(app)
            .get(`/users/${created.body.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(created.body.id);
    });

    test("PUT /users/:id/status", async () => {
        const created = await request(app)
            .post("/users")
            .send({
                name: "John",
                email: "john3@test.com"
            });

        const response = await request(app)
            .put(`/users/${created.body.id}/status`)
            .send({
                status: "SUSPENDED"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("SUSPENDED");
    });

    test("DELETE /users/:id", async () => {
        const created = await request(app)
            .post("/users")
            .send({
                name: "John",
                email: "john4@test.com"
            });

        const response = await request(app)
            .delete(`/users/${created.body.id}`);

        expect(response.statusCode).toBe(204);
    });

});