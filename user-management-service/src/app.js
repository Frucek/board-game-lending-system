const express = require("express");

const {
    getUsers,
    getUser,
    createUser,
    updateUserStatus,
    deleteUser
} = require("./userService");

const {
    publishEvent
} = require("./messageBroker");

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

    createUser(name, email).subscribe({

        next: user => {

            publishEvent(
                "UserCreated",
                user
            );

            res.status(201).json(user);
        },

        error: error => {

            console.error(error);

            res.status(400).json({
                error: "Could not create user"
            });
        }
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

    updateUserStatus(
        req.params.id,
        status
    ).subscribe({

        next: user => {

            if (!user) {

                res.status(404).json({
                    error: "User not found"
                });

                return;
            }

            publishEvent(
                "UserStatusChanged",
                user
            );

            res.json(user);
        },

        error: error => {

            console.error(error);

            res.status(500).json({
                error: "Could not update user"
            });
        }
    });
});


/*
 * DELETE /users/:id
 */
app.delete("/users/:id", (req, res) => {

    deleteUser(req.params.id).subscribe({

        next: deleted => {

            if (!deleted) {

                res.status(404).json({
                    error: "User not found"
                });

                return;
            }

            publishEvent(
                "UserDeleted",
                {
                    id: Number(req.params.id)
                }
            );

            res.status(204).send();
        },

        error: error => {

            console.error(error);

            res.status(500).json({
                error: "Could not delete user"
            });
        }
    });
});


app.get("/health", (req, res) => {

    res.json({
        status: "UP"
    });
});


module.exports = app;