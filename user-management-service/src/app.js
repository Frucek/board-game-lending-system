const express = require("express");

const {
    getUsers,
    getUser,
    createUser,
    updateUserStatus,
    deleteUser
} = require("./userService");

const app = express();

app.use(express.json());


app.get("/users", (req, res) => {

    getUsers().subscribe({

        next: users => {
            res.json(users);
        },

        error: error => {

            console.error(error);

            res.status(500).json({
                error: "Failed to get users"
            });
        }
    });
});


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
            res.status(201).json(user);
        },

        error: error => {

            console.error(error);

            if (
                error.code === "SQLITE_CONSTRAINT" ||
                error.code === "SQLITE_CONSTRAINT_UNIQUE"
            ) {

                res.status(400).json({
                    error: "Could not create user"
                });

                return;
            }

            res.status(500).json({
                error: "Could not create user"
            });
        }
    });
});


app.put("/users/:id/status", (req, res) => {

    const {
        status
    } = req.body;

    if (
        status !== "ACTIVE" &&
        status !== "SUSPENDED"
    ) {

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


app.delete("/users/:id", (req, res) => {

    deleteUser(
        req.params.id
    ).subscribe({

        next: deleted => {

            if (!deleted) {

                res.status(404).json({
                    error: "User not found"
                });

                return;
            }

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