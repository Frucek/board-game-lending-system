const axios = require("axios");

const GAME_CATALOG_URL =
    process.env.GAME_CATALOG_URL ||
    "http://localhost:8081";

async function getGames() {

    console.log("BFF -> Game Catalog: GET /games");

    const response = await axios.get(
        `${GAME_CATALOG_URL}/games`
    );

    return response.data;
}

async function getGame(id) {

    console.log(
        `BFF -> Game Catalog: GET /games/${id}`
    );

    const response = await axios.get(
        `${GAME_CATALOG_URL}/games/${id}`
    );

    return response.data;
}

module.exports = {
    getGames,
    getGame
};