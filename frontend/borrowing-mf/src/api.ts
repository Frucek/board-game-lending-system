export interface Borrowing {
    id: number;
    userId: number;
    gameId: number;
    borrowedAt: string;
    returnedAt?: string;
    status: string;
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

export function getBorrowings(): Promise<Borrowing[]> {
    return request<Borrowing[]>(`${API_URL}/borrowings`);
}

export function borrowGame(userId: number, gameId: number): Promise<Borrowing> {
    return request<Borrowing>(`${API_URL}/borrowings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, gameId })
    });
}

export function returnGame(id: number): Promise<void> {
    return request<void>(`${API_URL}/borrowings/${id}/return`, {
        method: "PUT"
    });
}
