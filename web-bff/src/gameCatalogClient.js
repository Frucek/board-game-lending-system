const axios = require("axios");
const CircuitBreaker = require("opossum");


const GAME_CATALOG_URL =
    process.env.GAME_CATALOG_URL ||
    "http://localhost:8081";


/*
 * ==========================================
 * RAW GAME CATALOG CALLS
 * ==========================================
 */

async function requestGetGames() {

    console.log(
        "BFF -> Game Catalog: GET /games"
    );

    const response = await axios.get(
        `${GAME_CATALOG_URL}/games`,
        {
            timeout: 2000
        }
    );

    return response.data;
}


async function requestGetGame(id) {

    console.log(
        `BFF -> Game Catalog: GET /games/${id}`
    );

    const response = await axios.get(
        `${GAME_CATALOG_URL}/games/${id}`,
        {
            timeout: 2000
        }
    );

    return response.data;
}


async function requestCreateGame(game) {

    console.log(
        "BFF -> Game Catalog: POST /games"
    );

    const response = await axios.post(
        `${GAME_CATALOG_URL}/games`,
        game,
        {
            timeout: 2000
        }
    );

    return response.data;
}


async function requestUpdateGame(id, game) {

    console.log(
        `BFF -> Game Catalog: PUT /games/${id}`
    );

    const response = await axios.put(
        `${GAME_CATALOG_URL}/games/${id}`,
        game,
        {
            timeout: 2000
        }
    );

    return response.data;
}


async function requestDeleteGame(id) {

    console.log(
        `BFF -> Game Catalog: DELETE /games/${id}`
    );

    const response = await axios.delete(
        `${GAME_CATALOG_URL}/games/${id}`,
        {
            timeout: 2000
        }
    );

    return response.data;
}


/*
 * ==========================================
 * CIRCUIT BREAKER
 * ==========================================
 *
 * The breaker:
 *
 * - opens after enough failures
 * - remains open for 10 seconds
 * - then allows test requests
 */

const circuitOptions = {

    timeout: Number(
        process.env.CIRCUIT_BREAKER_TIMEOUT || 3000
    ),

    errorThresholdPercentage: Number(
        process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD || 50
    ),

    resetTimeout: Number(
        process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || 10000
    ),

    volumeThreshold: 3
};


const gameCatalogGetGamesBreaker =
    new CircuitBreaker(
        requestGetGames,
        circuitOptions
    );


const gameCatalogGetGameBreaker =
    new CircuitBreaker(
        requestGetGame,
        circuitOptions
    );


const gameCatalogCreateGameBreaker =
    new CircuitBreaker(
        requestCreateGame,
        circuitOptions
    );


const gameCatalogUpdateGameBreaker =
    new CircuitBreaker(
        requestUpdateGame,
        circuitOptions
    );


const gameCatalogDeleteGameBreaker =
    new CircuitBreaker(
        requestDeleteGame,
        circuitOptions
    );


/*
 * ==========================================
 * CIRCUIT BREAKER EVENTS
 * ==========================================
 */

const circuitBreakers = [
    gameCatalogGetGamesBreaker,
    gameCatalogGetGameBreaker,
    gameCatalogCreateGameBreaker,
    gameCatalogUpdateGameBreaker,
    gameCatalogDeleteGameBreaker
];


function registerCircuitBreakerEvents(breaker, name) {

    breaker.on("open", () => {
        console.warn(
            `CIRCUIT BREAKER: Game Catalog ${name} circuit OPEN`
        );
    });

    breaker.on("halfOpen", () => {
        console.log(
            `CIRCUIT BREAKER: Game Catalog ${name} circuit HALF-OPEN`
        );
    });

    breaker.on("close", () => {
        console.log(
            `CIRCUIT BREAKER: Game Catalog ${name} circuit CLOSED`
        );
    });

    breaker.on("fallback", () => {
        console.warn(
            `CIRCUIT BREAKER: Game Catalog ${name} fallback executed`
        );
    });
}

registerCircuitBreakerEvents(
    gameCatalogGetGamesBreaker,
    "GET /games"
);

registerCircuitBreakerEvents(
    gameCatalogGetGameBreaker,
    "GET /games/:id"
);

registerCircuitBreakerEvents(
    gameCatalogCreateGameBreaker,
    "POST /games"
);

registerCircuitBreakerEvents(
    gameCatalogUpdateGameBreaker,
    "PUT /games/:id"
);

registerCircuitBreakerEvents(
    gameCatalogDeleteGameBreaker,
    "DELETE /games/:id"
);

/*
 * ==========================================
 * PUBLIC METHODS
 * ==========================================
 */

async function getGames() {

    return gameCatalogGetGamesBreaker.fire();
}


async function getGame(id) {

    return gameCatalogGetGameBreaker.fire(id);
}


async function createGame(game) {

    return gameCatalogCreateGameBreaker.fire(game);
}


async function updateGame(id, game) {

    return gameCatalogUpdateGameBreaker.fire(
        id,
        game
    );
}


async function deleteGame(id) {

    return gameCatalogDeleteGameBreaker.fire(id);
}


module.exports = {

    getGames,
    getGame,
    createGame,
    updateGame,
    deleteGame
};