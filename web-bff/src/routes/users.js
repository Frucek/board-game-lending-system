const express = require("express");

const {
    getUsers,
    getUser,
    createUser
} = require("../userClient");

const router = express.Router();

router.get("/users", async (req, res) => {

    try {

        const users = await getUsers();

        res.json(users);

    } catch (error) {

        console.error(error.message);

        res.status(502).json({
            error: "User Management Service unavailable"
        });
    }
});

router.get("/users/:id", async (req, res) => {

    try {

        const user = await getUser(req.params.id);

        res.json(user);

    } catch (error) {

        res.status(502).json({
            error: "User Management Service unavailable"
        });
    }
});

router.post("/users", async (req, res) => {

    try {

        const user =
            await createUser(req.body);

        res.status(201).json(user);

    } catch (error) {

        res.status(502).json({
            error: "User Management Service unavailable"
        });
    }
});

module.exports = router;