const database = require("../src/database");

const {
    getUsers,
    getUser,
    createUser,
    updateUserStatus,
    deleteUser
} = require("../src/userService");


beforeAll(async () => {
    await database.initializeDatabase();
});


beforeEach(() => {

    return new Promise((resolve, reject) => {

        database.database.serialize(() => {

            database.database.run(
                "DELETE FROM outbox",
                error => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    database.database.run(
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

        database.database.close(() => {
            resolve();
        });
    });
});


function observableToPromise(observable) {

    return new Promise(
        (resolve, reject) => {

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
        }
    );
}


describe("User Service", () => {


    test("creates a user", async () => {

        const user =
            await observableToPromise(
                createUser(
                    "John Smith",
                    "john@test.com"
                )
            );


        expect(user.name)
            .toBe("John Smith");

        expect(user.email)
            .toBe("john@test.com");

        expect(user.status)
            .toBe("ACTIVE");

        expect(user.borrowing_limit)
            .toBe(3);
    });


    test("gets a user", async () => {

        const created =
            await observableToPromise(
                createUser(
                    "John Smith",
                    "john2@test.com"
                )
            );


        const user =
            await observableToPromise(
                getUser(created.id)
            );


        expect(user)
            .not
            .toBeNull();

        expect(user.id)
            .toBe(created.id);

        expect(user.name)
            .toBe("John Smith");
    });


    test("returns null when user does not exist", async () => {

        const user =
            await observableToPromise(
                getUser(999999)
            );


        expect(user)
            .toBeNull();
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


        const users =
            await observableToPromise(
                getUsers()
            );


        expect(users.length)
            .toBe(2);


        expect(
            users.some(
                user =>
                    user.name === "John"
            )
        ).toBe(true);


        expect(
            users.some(
                user =>
                    user.name === "Jane"
            )
        ).toBe(true);
    });


    test("updates user status", async () => {

        const created =
            await observableToPromise(
                createUser(
                    "John",
                    "john4@test.com"
                )
            );


        const updated =
            await observableToPromise(
                updateUserStatus(
                    created.id,
                    "SUSPENDED"
                )
            );


        expect(updated)
            .not
            .toBeNull();

        expect(updated.id)
            .toBe(created.id);

        expect(updated.status)
            .toBe("SUSPENDED");
    });


    test("deletes a user", async () => {

        const created =
            await observableToPromise(
                createUser(
                    "John",
                    "john5@test.com"
                )
            );


        const deleted =
            await observableToPromise(
                deleteUser(created.id)
            );


        expect(deleted)
            .toBe(true);


        const user =
            await observableToPromise(
                getUser(created.id)
            );


        expect(user)
            .toBeNull();
    });


    test("delete returns false for nonexistent user", async () => {

        const deleted =
            await observableToPromise(
                deleteUser(999999)
            );


        expect(deleted)
            .toBe(false);
    });

});