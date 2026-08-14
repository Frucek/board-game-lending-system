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


async function createGame(game) {

    console.log(
        "BFF -> Game Catalog: POST /games"
    );

    const response = await axios.post(
        `${GAME_CATALOG_URL}/games`,
        game
    );

    return response.data;
}


async function updateGame(id, game) {

    console.log(
        `BFF -> Game Catalog: PUT /games/${id}`
    );

    const response = await axios.put(
        `${GAME_CATALOG_URL}/games/${id}`,
        game
    );

    return response.data;
}


async function deleteGame(id) {

    console.log(
        `BFF -> Game Catalog: DELETE /games/${id}`
    );

    const response = await axios.delete(
        `${GAME_CATALOG_URL}/games/${id}`
    );

    return response.data;
}


module.exports = {
    getGames,
    getGame,
    createGame,
    updateGame,
    deleteGame
};