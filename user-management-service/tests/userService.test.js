const fs = require("fs");

const database = require("../src/database");

const {
    getUsers,
    getUser,
    createUser,
    updateUserStatus,
    deleteUser
} = require("../src/userService");

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


function observableToPromise(observable) {

    return new Promise((resolve, reject) => {

        let result;

        observable.subscribe({

            next: value => {
                result = value;
            },

            error: error => {
                reject(error);
            },

            complete: () => {
                resolve(result);
            }
        });
    });
}


test("creates a user", async () => {

    const user = await observableToPromise(
        createUser(
            "John Smith",
            "john@test.com"
        )
    );

    expect(user.name).toBe("John Smith");
    expect(user.email).toBe("john@test.com");
    expect(user.status).toBe("ACTIVE");
    expect(user.borrowingLimit).toBe(3);
});


test("gets a user", async () => {

    const created = await observableToPromise(
        createUser(
            "John Smith",
            "john2@test.com"
        )
    );

    const user = await observableToPromise(
        getUser(created.id)
    );

    expect(user.id).toBe(created.id);
});


test("gets all users", async () => {

    await observableToPromise(
        createUser(
            "John",
            "john3@test.com"
        )
    );

    await observableToPromise(
        createUser(
            "Jane",
            "jane3@test.com"
        )
    );

    const users = await observableToPromise(
        getUsers()
    );

    expect(users.length).toBe(2);
});


test("updates user status", async () => {

    const created = await observableToPromise(
        createUser(
            "John",
            "john4@test.com"
        )
    );

    const updated = await observableToPromise(
        updateUserStatus(
            created.id,
            "SUSPENDED"
        )
    );

    expect(updated.status).toBe("SUSPENDED");
});


test("deletes a user", async () => {

    const created = await observableToPromise(
        createUser(
            "John",
            "john5@test.com"
        )
    );

    const deleted = await observableToPromise(
        deleteUser(created.id)
    );

    expect(deleted).toBe(true);

    const user = await observableToPromise(
        getUser(created.id)
    );

    expect(user).toBeNull();
});