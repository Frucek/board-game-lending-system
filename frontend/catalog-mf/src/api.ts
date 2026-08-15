export interface Game {
    id: number;
    name: string;
    description?: string;
    category: string;
    minPlayers: number;
    maxPlayers: number;
    difficulty: string;
    available?: boolean;
}

export interface GameInput {
    name: string;
    description: string;
    category: string;
    minPlayers: number;
    maxPlayers: number;
    difficulty: string;
}

const API_URL = "/api/web";

async function request<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(url, options);

    const text = await response.text();

    if (!response.ok) {
        let message = `Request failed (${response.status})`;

        if (text) {
            try {
                const body = JSON.parse(text);

                if (body.error) {
                    message = body.error;
                } else if (body.message) {
                    message = body.message;
                }
            } catch {
                message = text;
            }
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    if (!text) {
        return undefined as T;
    }

    return JSON.parse(text) as T;
}


/**
 * GET /games
 */
export function getGames(): Promise<Game[]> {
    return request<Game[]>(
        `${API_URL}/games`
    );
}


/**
 * GET /games/:id
 */
export function getGame(
    id: number
): Promise<Game> {
    return request<Game>(
        `${API_URL}/games/${id}`
    );
}


/**
 * POST /games
 */
export function createGame(
    game: GameInput
): Promise<Game> {
    return request<Game>(
        `${API_URL}/games`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(game)
        }
    );
}


/**
 * PUT /games/:id
 */
export function updateGame(
    id: number,
    game: GameInput
): Promise<Game> {
    return request<Game>(
        `${API_URL}/games/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(game)
        }
    );
}


/**
 * DELETE /games/:id
 */
export function deleteGame(
    id: number
): Promise<void> {
    return request<void>(
        `${API_URL}/games/${id}`,
        {
            method: "DELETE"
        }
    );
}