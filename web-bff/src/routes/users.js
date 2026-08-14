const express = require("express");

const {
    getUsers,
    getUser,
    createUser,
    updateUserStatus,
    deleteUser
} = require("../userClient");

const router = express.Router();


function isPositiveInteger(value) {

    const number = Number(value);

    return Number.isInteger(number) && number > 0;
}


router.get("/users", async (req, res) => {

    try {

        const users = await getUsers();

        res.status(200).json(users);

    } catch (error) {

        console.error(
            "User Management error:",
            error.message
        );

        res.status(502).json({
            error:
                "User Management Service unavailable"
        });
    }
});


router.get("/users/:id", async (req, res) => {

    if (!isPositiveInteger(req.params.id)) {

        return res.status(400).json({
            error:
                "User id must be a positive integer"
        });
    }

    try {

        const user = await getUser(
            req.params.id
        );

        res.status(200).json(user);

    } catch (error) {

        console.error(
            "User Management error:",
            error.message
        );

        if (
            error.response &&
            error.response.status === 404
        ) {

            return res.status(404).json({
                error: "User not found"
            });
        }

        res.status(502).json({
            error:
                "User Management Service unavailable"
        });
    }
});


router.post("/users", async (req, res) => {

    const {
        name,
        email
    } = req.body;

    if (!name || !email) {

        return res.status(400).json({
            error:
                "Name and email are required"
        });
    }

    try {

        const user = await createUser({
            name,
            email
        });

        res.status(201).json(user);

    } catch (error) {

        console.error(
            "User Management error:",
            error.message
        );

        if (
            error.response &&
            error.response.status === 400
        ) {

            return res.status(400).json({
                error:
                    error.response.data?.error ||
                    "Could not create user"
            });
        }

        res.status(502).json({
            error:
                "User Management Service unavailable"
        });
    }
});


router.put(
    "/users/:id/status",
    async (req, res) => {

        if (!isPositiveInteger(req.params.id)) {

            return res.status(400).json({
                error:
                    "User id must be a positive integer"
            });
        }

        const {
            status
        } = req.body;

        if (
            status !== "ACTIVE" &&
            status !== "SUSPENDED"
        ) {

            return res.status(400).json({
                error:
                    "Status must be ACTIVE or SUSPENDED"
            });
        }

        try {

            const user =
                await updateUserStatus(
                    req.params.id,
                    status
                );

            res.status(200).json(user);

        } catch (error) {

            console.error(
                "User Management error:",
                error.message
            );

            if (
                error.response &&
                error.response.status === 404
            ) {

                return res.status(404).json({
                    error: "User not found"
                });
            }

            res.status(502).json({
                error:
                    "User Management Service unavailable"
            });
        }
    }
);


router.delete(
    "/users/:id",
    async (req, res) => {

        if (!isPositiveInteger(req.params.id)) {

            return res.status(400).json({
                error:
                    "User id must be a positive integer"
            });
        }

        try {

            await deleteUser(
                req.params.id
            );

            res.status(204).send();

        } catch (error) {

            console.error(
                "User Management error:",
                error.message
            );

            if (
                error.response &&
                error.response.status === 404
            ) {

                return res.status(404).json({
                    error: "User not found"
                });
            }

            res.status(502).json({
                error:
                    "User Management Service unavailable"
            });
        }
    }
);


module.exports = router;