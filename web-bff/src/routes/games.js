const express = require("express");

const {
    getGames,
    getGame,
    createGame,
    updateGame,
    deleteGame
} = require("../gameCatalogClient");

const router = express.Router();


function isPositiveInteger(value) {

    const number = Number(value);

    return Number.isInteger(number) && number > 0;
}


router.get("/games", async (req, res) => {

    try {

        const games = await getGames();

        res.status(200).json(games);

    } catch (error) {

        console.error(
            "Game Catalog error:",
            error.message
        );

        res.status(502).json({
            error: "Game Catalog Service unavailable"
        });
    }
});


router.get("/games/:id", async (req, res) => {

    if (!isPositiveInteger(req.params.id)) {

        return res.status(400).json({
            error: "Game id must be a positive integer"
        });
    }

    try {

        const game = await getGame(
            req.params.id
        );

        res.status(200).json(game);

    } catch (error) {

        console.error(
            "Game Catalog error:",
            error.message
        );

        if (
            error.response &&
            error.response.status === 404
        ) {

            return res.status(404).json({
                error: "Game not found"
            });
        }

        res.status(502).json({
            error: "Game Catalog Service unavailable"
        });
    }
});


router.post("/games", async (req, res) => {

    const {
        name,
        description,
        category,
        minPlayers,
        maxPlayers,
        difficulty
    } = req.body;

    if (
        !name ||
        !category ||
        minPlayers === undefined ||
        maxPlayers === undefined ||
        !difficulty
    ) {

        return res.status(400).json({
            error:
                "name, category, minPlayers, maxPlayers and difficulty are required"
        });
    }

    if (
        !Number.isInteger(Number(minPlayers)) ||
        !Number.isInteger(Number(maxPlayers)) ||
        Number(minPlayers) < 1 ||
        Number(maxPlayers) < Number(minPlayers)
    ) {

        return res.status(400).json({
            error:
                "Invalid player count"
        });
    }

    try {

        const game = await createGame({
            name,
            description,
            category,
            minPlayers: Number(minPlayers),
            maxPlayers: Number(maxPlayers),
            difficulty
        });

        res.status(201).json(game);

    } catch (error) {

        console.error(
            "Game Catalog error:",
            error.message
        );

        if (
            error.response &&
            error.response.status === 400
        ) {

            return res.status(400).json({
                error:
                    error.response.data?.message ||
                    error.response.data?.error ||
                    "Invalid game data"
            });
        }

        res.status(502).json({
            error: "Game Catalog Service unavailable"
        });
    }
});


router.put("/games/:id", async (req, res) => {

    if (!isPositiveInteger(req.params.id)) {

        return res.status(400).json({
            error: "Game id must be a positive integer"
        });
    }

    try {

        const game = await updateGame(
            req.params.id,
            req.body
        );

        res.status(200).json(game);

    } catch (error) {

        console.error(
            "Game Catalog error:",
            error.message
        );

        if (
            error.response &&
            error.response.status === 404
        ) {

            return res.status(404).json({
                error: "Game not found"
            });
        }

        if (
            error.response &&
            error.response.status === 400
        ) {

            return res.status(400).json({
                error:
                    error.response.data?.message ||
                    error.response.data?.error ||
                    "Invalid game data"
            });
        }

        res.status(502).json({
            error: "Game Catalog Service unavailable"
        });
    }
});


router.delete("/games/:id", async (req, res) => {

    if (!isPositiveInteger(req.params.id)) {

        return res.status(400).json({
            error: "Game id must be a positive integer"
        });
    }

    try {

        await deleteGame(req.params.id);

        res.status(204).send();

    } catch (error) {

        console.error(
            "Game Catalog error:",
            error.message
        );

        if (
            error.response &&
            error.response.status === 404
        ) {

            return res.status(404).json({
                error: "Game not found"
            });
        }

        res.status(502).json({
            error: "Game Catalog Service unavailable"
        });
    }
});


module.exports = router;