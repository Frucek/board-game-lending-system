const request = require("supertest");

const app = require("../src/app");

const {
    database,
    initializeDatabase
} = require("../src/database");


beforeAll(async () => {
    await initializeDatabase();
});

beforeEach(() => {

    return new Promise((resolve, reject) => {

        database.serialize(() => {

            database.run(
                "DELETE FROM outbox",
                error => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    database.run(
                        "DELETE FROM users",
                        error => {

                            if (error) {
                                reject(error);
                                return;
                            }

                            resolve();
                        }
                    );
                }
            );
        });
    });
});


afterAll(() => {

    return new Promise((resolve) => {

        database.close(() => {
            resolve();
        });
    });
});


function getOutboxEvents() {

    return new Promise((resolve, reject) => {

        database.all(
            `
            SELECT *
            FROM outbox
            ORDER BY id ASC
            `,
            [],
            (error, rows) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(rows);
            }
        );
    });
}


describe("User Management API", () => {


    test("GET /users", async () => {

        const response =
            await request(app)
                .get("/users");


        expect(response.statusCode)
            .toBe(200);

        expect(
            Array.isArray(response.body)
        ).toBe(true);
    });


    test("POST /users creates user and outbox event", async () => {

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

        expect(response.body.email)
            .toBe("john@test.com");

        expect(response.body.status)
            .toBe("ACTIVE");

        expect(response.body.borrowing_limit)
            .toBe(3);


        const events =
            await getOutboxEvents();


        expect(events.length)
            .toBe(1);

        expect(events[0].event_type)
            .toBe("UserCreated");

        expect(events[0].published)
            .toBe(0);


        const payload =
            JSON.parse(events[0].payload);


        expect(payload.id)
            .toBe(response.body.id);

        expect(payload.name)
            .toBe("John");

        expect(payload.email)
            .toBe("john@test.com");
    });


    test("GET /users/:id returns user", async () => {

        const created =
            await request(app)
                .post("/users")
                .send({
                    name: "John",
                    email: "john2@test.com"
                });


        const response =
            await request(app)
                .get(
                    `/users/${created.body.id}`
                );


        expect(response.statusCode)
            .toBe(200);

        expect(response.body.id)
            .toBe(created.body.id);

        expect(response.body.name)
            .toBe("John");
    });


    test("GET /users/:id returns 404 for unknown user", async () => {

        const response =
            await request(app)
                .get("/users/999999");


        expect(response.statusCode)
            .toBe(404);

        expect(response.body.error)
            .toBe("User not found");
    });


    test("PUT /users/:id/status updates user and creates outbox event", async () => {

        const created =
            await request(app)
                .post("/users")
                .send({
                    name: "John",
                    email: "john3@test.com"
                });


        const response =
            await request(app)
                .put(
                    `/users/${created.body.id}/status`
                )
                .send({
                    status: "SUSPENDED"
                });


        expect(response.statusCode)
            .toBe(200);

        expect(response.body.status)
            .toBe("SUSPENDED");


        const events =
            await getOutboxEvents();


        /*
         * One event from POST
         * One event from PUT
         */
        expect(events.length)
            .toBe(2);


        const statusEvent =
            events.find(
                event =>
                    event.event_type ===
                    "UserStatusChanged"
            );


        expect(statusEvent)
            .toBeDefined();

        expect(statusEvent.published)
            .toBe(0);


        const payload =
            JSON.parse(statusEvent.payload);


        expect(payload.id)
            .toBe(created.body.id);

        expect(payload.status)
            .toBe("SUSPENDED");
    });


    test("PUT /users/:id/status rejects invalid status", async () => {

        const created =
            await request(app)
                .post("/users")
                .send({
                    name: "John",
                    email: "john-invalid-status@test.com"
                });


        const response =
            await request(app)
                .put(
                    `/users/${created.body.id}/status`
                )
                .send({
                    status: "INVALID"
                });


        expect(response.statusCode)
            .toBe(400);

        expect(response.body.error)
            .toBe(
                "Status must be ACTIVE or SUSPENDED"
            );
    });


    test("PUT /users/:id/status returns 404 for unknown user", async () => {

        const response =
            await request(app)
                .put("/users/999999/status")
                .send({
                    status: "SUSPENDED"
                });


        expect(response.statusCode)
            .toBe(404);

        expect(response.body.error)
            .toBe("User not found");
    });


    test("DELETE /users/:id deletes user and creates outbox event", async () => {

        const created =
            await request(app)
                .post("/users")
                .send({
                    name: "John",
                    email: "john4@test.com"
                });


        const response =
            await request(app)
                .delete(
                    `/users/${created.body.id}`
                );


        expect(response.statusCode)
            .toBe(204);

        expect(response.body)
            .toEqual({});


        const getResponse =
            await request(app)
                .get(
                    `/users/${created.body.id}`
                );


        expect(getResponse.statusCode)
            .toBe(404);


        const events =
            await getOutboxEvents();


        /*
         * One UserCreated event
         * One UserDeleted event
         */
        expect(events.length)
            .toBe(2);


        const deleteEvent =
            events.find(
                event =>
                    event.event_type ===
                    "UserDeleted"
            );


        expect(deleteEvent)
            .toBeDefined();

        expect(deleteEvent.published)
            .toBe(0);


        const payload =
            JSON.parse(deleteEvent.payload);


        expect(payload.id)
            .toBe(created.body.id);
    });


    test("DELETE /users/:id returns 404 for unknown user", async () => {

        const response =
            await request(app)
                .delete("/users/999999");


        expect(response.statusCode)
            .toBe(404);

        expect(response.body.error)
            .toBe("User not found");
    });


    test("POST /users rejects missing name", async () => {

        const response =
            await request(app)
                .post("/users")
                .send({
                    email: "missing-name@test.com"
                });


        expect(response.statusCode)
            .toBe(400);

        expect(response.body.error)
            .toBe("Name and email are required");
    });


    test("POST /users rejects missing email", async () => {

        const response =
            await request(app)
                .post("/users")
                .send({
                    name: "John"
                });


        expect(response.statusCode)
            .toBe(400);

        expect(response.body.error)
            .toBe("Name and email are required");
    });


    test("POST /users rejects duplicate email", async () => {

        await request(app)
            .post("/users")
            .send({
                name: "John",
                email: "duplicate@test.com"
            });


        const response =
            await request(app)
                .post("/users")
                .send({
                    name: "Jane",
                    email: "duplicate@test.com"
                });


        expect(response.statusCode)
            .toBe(400);
    });

});