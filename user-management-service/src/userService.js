const { Observable } = require("rxjs");

const {
    database
} = require("./database");

const {
    addEvent
} = require("./outbox");

const User = require("./user");


function rowToUser(row) {
    if (!row) {
        return null;
    }

    return new User(
        row.id,
        row.name,
        row.email,
        row.status,
        row.borrowing_limit
    );
}


function getUsers() {

    return new Observable(subscriber => {

        database.all(
            "SELECT * FROM users ORDER BY id ASC",
            [],
            (error, rows) => {

                if (error) {
                    subscriber.error(error);
                    return;
                }

                subscriber.next(
                    rows.map(rowToUser)
                );

                subscriber.complete();
            }
        );
    });
}


function getUser(id) {

    return new Observable(subscriber => {

        database.get(
            "SELECT * FROM users WHERE id = ?",
            [id],
            (error, row) => {

                if (error) {
                    subscriber.error(error);
                    return;
                }

                subscriber.next(
                    rowToUser(row)
                );

                subscriber.complete();
            }
        );
    });
}


function createUser(name, email) {

    return new Observable(subscriber => {

        database.serialize(() => {

            database.run(
                "BEGIN TRANSACTION"
            );

            database.run(
                `
                INSERT INTO users
                (
                    name,
                    email,
                    status,
                    borrowing_limit
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    name,
                    email,
                    "ACTIVE",
                    3
                ],
                function(error) {

                    if (error) {

                        database.run(
                            "ROLLBACK"
                        );

                        subscriber.error(error);
                        return;
                    }

                    const userId =
                        this.lastID;

                    database.get(
                        `
                        SELECT *
                        FROM users
                        WHERE id = ?
                        `,
                        [userId],
                        (selectError, row) => {

                            if (selectError) {

                                database.run(
                                    "ROLLBACK"
                                );

                                subscriber.error(
                                    selectError
                                );

                                return;
                            }

                            const user =
                                rowToUser(row);

                            addEvent(
                                "UserCreated",
                                {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    status: user.status,
                                    borrowing_limit:
                                        user.borrowing_limit
                                },
                                eventError => {

                                    if (eventError) {

                                        database.run(
                                            "ROLLBACK"
                                        );

                                        subscriber.error(
                                            eventError
                                        );

                                        return;
                                    }

                                    database.run(
                                        "COMMIT",
                                        commitError => {

                                            if (commitError) {

                                                database.run(
                                                    "ROLLBACK"
                                                );

                                                subscriber.error(
                                                    commitError
                                                );

                                                return;
                                            }

                                            subscriber.next(
                                                user
                                            );

                                            subscriber.complete();
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        });
    });
}


function updateUserStatus(id, status) {

    return new Observable(subscriber => {

        database.serialize(() => {

            database.run(
                "BEGIN TRANSACTION"
            );

            database.run(
                `
                UPDATE users
                SET status = ?
                WHERE id = ?
                `,
                [status, id],
                function(error) {

                    if (error) {

                        database.run(
                            "ROLLBACK"
                        );

                        subscriber.error(error);
                        return;
                    }

                    if (this.changes === 0) {

                        database.run(
                            "ROLLBACK"
                        );

                        subscriber.next(null);
                        subscriber.complete();

                        return;
                    }

                    database.get(
                        `
                        SELECT *
                        FROM users
                        WHERE id = ?
                        `,
                        [id],
                        (selectError, row) => {

                            if (selectError) {

                                database.run(
                                    "ROLLBACK"
                                );

                                subscriber.error(
                                    selectError
                                );

                                return;
                            }

                            const user =
                                rowToUser(row);

                            addEvent(
                                "UserStatusChanged",
                                {
                                    id: user.id,
                                    status: user.status
                                },
                                eventError => {

                                    if (eventError) {

                                        database.run(
                                            "ROLLBACK"
                                        );

                                        subscriber.error(
                                            eventError
                                        );

                                        return;
                                    }

                                    database.run(
                                        "COMMIT",
                                        commitError => {

                                            if (commitError) {

                                                database.run(
                                                    "ROLLBACK"
                                                );

                                                subscriber.error(
                                                    commitError
                                                );

                                                return;
                                            }

                                            subscriber.next(
                                                user
                                            );

                                            subscriber.complete();
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        });
    });
}


function deleteUser(id) {

    return new Observable(subscriber => {

        database.serialize(() => {

            database.run(
                "BEGIN TRANSACTION"
            );

            database.run(
                `
                DELETE FROM users
                WHERE id = ?
                `,
                [id],
                function(error) {

                    if (error) {

                        database.run(
                            "ROLLBACK"
                        );

                        subscriber.error(error);
                        return;
                    }

                    if (this.changes === 0) {

                        database.run(
                            "ROLLBACK"
                        );

                        subscriber.next(false);
                        subscriber.complete();

                        return;
                    }

                    addEvent(
                        "UserDeleted",
                        {
                            id: Number(id)
                        },
                        eventError => {

                            if (eventError) {

                                database.run(
                                    "ROLLBACK"
                                );

                                subscriber.error(
                                    eventError
                                );

                                return;
                            }

                            database.run(
                                "COMMIT",
                                commitError => {

                                    if (commitError) {

                                        database.run(
                                            "ROLLBACK"
                                        );

                                        subscriber.error(
                                            commitError
                                        );

                                        return;
                                    }

                                    subscriber.next(true);
                                    subscriber.complete();
                                }
                            );
                        }
                    );
                }
            );
        });
    });
}


module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUserStatus,
    deleteUser
};