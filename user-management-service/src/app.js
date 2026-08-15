const express = require("express");

const {
    getUsers,
    getUser,
    createUser,
    updateUserStatus,
    deleteUser
} = require("./userService");

const {
    database
} = require("./database");

const {
    addEvent
} = require("./outbox");

const app = express();

app.use(express.json());


/*
 * GET /users
 */
app.get("/users", (req, res) => {

    getUsers().subscribe({
        next: users => res.json(users),

        error: error => {
            console.error(error);

            res.status(500).json({
                error: "Failed to get users"
            });
        }
    });
});


/*
 * GET /users/:id
 */
app.get("/users/:id", (req, res) => {

    getUser(req.params.id).subscribe({

        next: user => {

            if (!user) {
                res.status(404).json({
                    error: "User not found"
                });

                return;
            }

            res.json(user);
        },

        error: error => {

            console.error(error);

            res.status(500).json({
                error: "Failed to get user"
            });
        }
    });
});


/*
 * POST /users
 */
app.post("/users", (req, res) => {

    const {
        name,
        email
    } = req.body;

    if (!name || !email) {

        res.status(400).json({
            error: "Name and email are required"
        });

        return;
    }

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

                    console.error(error);

                    res.status(400).json({
                        error:
                            "Could not create user"
                    });

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
                    (selectError, user) => {

                        if (selectError) {

                            database.run(
                                "ROLLBACK"
                            );

                            res.status(500).json({
                                error:
                                    "Could not create user"
                            });

                            return;
                        }


                        addEvent(
                            "UserCreated",
                            user,
                            (outboxError) => {

                                if (outboxError) {

                                    database.run(
                                        "ROLLBACK"
                                    );

                                    console.error(
                                        outboxError
                                    );

                                    res.status(500).json({
                                        error:
                                            "Could not create user"
                                    });

                                    return;
                                }


                                database.run(
                                    "COMMIT",
                                    (commitError) => {

                                        if (
                                            commitError
                                        ) {

                                            console.error(
                                                commitError
                                            );

                                            res.status(500).json({
                                                error:
                                                    "Could not create user"
                                            });

                                            return;
                                        }


                                        res.status(
                                            201
                                        ).json(user);
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


/*
 * PUT /users/:id/status
 */
app.put("/users/:id/status", (req, res) => {

    const {
        status
    } = req.body;

    const allowedStatuses = [
        "ACTIVE",
        "SUSPENDED"
    ];

    if (!allowedStatuses.includes(status)) {

        res.status(400).json({
            error: "Status must be ACTIVE or SUSPENDED"
        });

        return;
    }

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
            [
                status,
                req.params.id
            ],
            function(error) {

                if (error) {

                    database.run(
                        "ROLLBACK"
                    );

                    res.status(500).json({
                        error:
                            "Could not update user"
                    });

                    return;
                }


                if (this.changes === 0) {

                    database.run(
                        "ROLLBACK"
                    );

                    res.status(404).json({
                        error:
                            "User not found"
                    });

                    return;
                }


                database.get(
                    `
                    SELECT *
                    FROM users
                    WHERE id = ?
                    `,
                    [
                        req.params.id
                    ],
                    (selectError, user) => {

                        if (selectError) {

                            database.run(
                                "ROLLBACK"
                            );

                            res.status(500).json({
                                error:
                                    "Could not update user"
                            });

                            return;
                        }


                        addEvent(
                            "UserStatusChanged",
                            user,
                            (outboxError) => {

                                if (outboxError) {

                                    database.run(
                                        "ROLLBACK"
                                    );

                                    res.status(500).json({
                                        error:
                                            "Could not update user"
                                    });

                                    return;
                                }


                                database.run(
                                    "COMMIT",
                                    (commitError) => {

                                        if (
                                            commitError
                                        ) {

                                            res.status(500).json({
                                                error:
                                                    "Could not update user"
                                            });

                                            return;
                                        }


                                        res.json(user);
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


/*
 * DELETE /users/:id
 */
app.delete("/users/:id", (req, res) => {

    database.serialize(() => {

        database.run(
            "BEGIN TRANSACTION"
        );


        database.run(
            `
            DELETE FROM users
            WHERE id = ?
            `,
            [
                req.params.id
            ],
            function(error) {

                if (error) {

                    database.run(
                        "ROLLBACK"
                    );

                    res.status(500).json({
                        error:
                            "Could not delete user"
                    });

                    return;
                }


                if (this.changes === 0) {

                    database.run(
                        "ROLLBACK"
                    );

                    res.status(404).json({
                        error:
                            "User not found"
                    });

                    return;
                }


                addEvent(
                    "UserDeleted",
                    {
                        id:
                            Number(req.params.id)
                    },
                    (outboxError) => {

                        if (outboxError) {

                            database.run(
                                "ROLLBACK"
                            );

                            res.status(500).json({
                                error:
                                    "Could not delete user"
                            });

                            return;
                        }


                        database.run(
                            "COMMIT",
                            (commitError) => {

                                if (
                                    commitError
                                ) {

                                    res.status(500).json({
                                        error:
                                            "Could not delete user"
                                    });

                                    return;
                                }


                                res.status(
                                    204
                                ).send();
                            }
                        );
                    }
                );
            }
        );

    });
});


app.get("/health", (req, res) => {

    res.json({
        status: "UP"
    });
});


module.exports = app;