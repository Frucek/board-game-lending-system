const express = require("express");

const {
    borrowGame,
    returnGame,
    getBorrowing,
    getBorrowingHistory
} = require("../borrowingClient");

const router = express.Router();


function isPositiveInteger(value) {

    const number = Number(value);

    return Number.isInteger(number) && number > 0;
}


router.post("/borrowings", async (req, res) => {

    const {
        user_id,
        game_id
    } = req.body;

    if (
        !isPositiveInteger(user_id) ||
        !isPositiveInteger(game_id)
    ) {

        return res.status(400).json({
            error:
                "user_id and game_id must be positive integers"
        });
    }

    try {

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

        if (
            error.code === 3
        ) {

            return res.status(400).json({
                error: error.details
            });
        }

        res.status(502).json({
            error:
                "Borrowing Service unavailable"
        });
    }
});


router.get(
    "/borrowings/:id",
    async (req, res) => {

        if (
            !isPositiveInteger(req.params.id)
        ) {

            return res.status(400).json({
                error:
                    "Borrowing id must be a positive integer"
            });
        }

        try {

            const result =
                await getBorrowing(
                    req.params.id
                );

            res.status(200).json(result);

        } catch (error) {

            console.error(
                "Borrowing error:",
                error.message
            );

            if (
                error.code === 5
            ) {

                return res.status(404).json({
                    error: "Borrowing not found"
                });
            }

            res.status(502).json({
                error:
                    "Borrowing Service unavailable"
            });
        }
    }
);


router.put(
    "/borrowings/:id/return",
    async (req, res) => {

        if (
            !isPositiveInteger(req.params.id)
        ) {

            return res.status(400).json({
                error:
                    "Borrowing id must be a positive integer"
            });
        }

        try {

            const result =
                await returnGame(
                    req.params.id
                );

            res.status(200).json(result);

        } catch (error) {

            console.error(
                "Borrowing error:",
                error.message
            );

            if (
                error.code === 5
            ) {

                return res.status(404).json({
                    error:
                        error.details ||
                        "Borrowing not found"
                });
            }

            if (
                error.code === 3
            ) {

                return res.status(400).json({
                    error:
                        error.details
                });
            }

            res.status(502).json({
                error:
                    "Borrowing Service unavailable"
            });
        }
    }
);


router.get(
    "/users/:id/borrowings",
    async (req, res) => {

        if (
            !isPositiveInteger(req.params.id)
        ) {

            return res.status(400).json({
                error:
                    "User id must be a positive integer"
            });
        }

        try {

            const result =
                await getBorrowingHistory(
                    req.params.id
                );

            res.status(200).json({
                user_id: Number(req.params.id),
                borrowings:
                    result.borrowings || []
            });

        } catch (error) {

            console.error(
                "Borrowing error:",
                error.message
            );

            res.status(502).json({
                error:
                    "Borrowing Service unavailable"
            });
        }
    }
);


module.exports = router;