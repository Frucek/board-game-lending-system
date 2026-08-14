const express = require("express");

const {
    borrowGame,
    returnGame,
    getBorrowingHistory
} = require("../borrowingClient");

const router = express.Router();

router.post("/borrowings", async (req, res) => {

    try {

        const {
            user_id,
            game_id
        } = req.body;

        const result =
            await borrowGame(
                user_id,
                game_id
            );

        res.status(201).json(result);

    } catch (error) {

        console.error(
            "Borrowing error:",
            error.message
        );

        res.status(502).json({
            error: "Borrowing Service unavailable"
        });
    }
});

router.put(
    "/borrowings/:id/return",
    async (req, res) => {

        try {

            const result =
                await returnGame(
                    req.params.id
                );

            res.json(result);

        } catch (error) {

            res.status(502).json({
                error: "Borrowing Service unavailable"
            });
        }
    }
);

router.get(
    "/users/:id/borrowings",
    async (req, res) => {

        try {

            const result =
                await getBorrowingHistory(
                    req.params.id
                );

            res.json(result);

        } catch (error) {

            res.status(502).json({
                error: "Borrowing Service unavailable"
            });
        }
    }
);

module.exports = router;