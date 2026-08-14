export interface Game {
    id: number;
    name: string;
    category: string;
    players: string;
    difficulty: string;
    available: boolean;
}

const API_URL = "/api/web";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed (${response.status})`);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

export function getGames(): Promise<Game[]> {
    return request<Game[]>(`${API_URL}/games`);
}

export function getGame(id: number): Promise<Game> {
    return request<Game>(`${API_URL}/games/${id}`);
}

export function createGame(game: Omit<Game, "id">): Promise<Game> {
    return request<Game>(`${API_URL}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game)
    });
}

export function updateGame(id: number, game: Omit<Game, "id">): Promise<Game> {
    return request<Game>(`${API_URL}/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game)
    });
}

export function deleteGame(id: number): Promise<void> {
    return request<void>(`${API_URL}/games/${id}`, { method: "DELETE" });
}
