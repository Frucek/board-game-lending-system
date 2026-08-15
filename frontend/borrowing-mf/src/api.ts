export type BorrowingStatus =
    | "ACTIVE"
    | "RETURNED"
    | "BORROWED"
    | string;


export interface Borrowing {
    id: number;
    user_id: number;
    game_id: number;
    borrowed_at: string;
    returned_at?: string;
    status: BorrowingStatus;
}


export interface BorrowingHistoryResponse {
    user_id: number;
    borrowings: Borrowing[];
}


const API_URL = "/api/web";


/*
 * ==========================================
 * GENERIC REQUEST HELPER
 * ==========================================
 */

async function request<T>(
    url: string,
    options?: RequestInit
): Promise<T> {

    const response =
        await fetch(url, options);

    const text =
        await response.text();


    if (!response.ok) {

        let message =
            `Request failed (${response.status})`;


        if (text) {

            try {

                const body =
                    JSON.parse(text);

                if (body.error) {

                    message =
                        body.error;

                } else if (body.message) {

                    message =
                        body.message;
                }

            } catch {

                message = text;
            }
        }


        throw new Error(message);
    }


    /*
     * DELETE / 204-style responses.
     */

    if (
        response.status === 204 ||
        !text
    ) {

        return undefined as T;
    }


    return JSON.parse(text) as T;
}


/*
 * ==========================================
 * BORROW GAME
 *
 * POST /api/web/borrowings
 * ==========================================
 */

export function borrowGame(
    userId: number,
    gameId: number
): Promise<Borrowing> {

    return request<Borrowing>(
        `${API_URL}/borrowings`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                user_id: userId,
                game_id: gameId
            })
        }
    );
}


/*
 * ==========================================
 * GET BORROWING
 *
 * GET /api/web/borrowings/:id
 * ==========================================
 */

export function getBorrowing(
    id: number
): Promise<Borrowing> {

    return request<Borrowing>(
        `${API_URL}/borrowings/${id}`
    );
}


/*
 * ==========================================
 * RETURN GAME
 *
 * PUT /api/web/borrowings/:id/return
 * ==========================================
 */

export function returnGame(
    id: number
): Promise<Borrowing> {

    return request<Borrowing>(
        `${API_URL}/borrowings/${id}/return`,
        {
            method: "PUT"
        }
    );
}


/*
 * ==========================================
 * BORROWING HISTORY
 *
 * GET /api/web/users/:id/borrowings
 * ==========================================
 */

export function getBorrowingHistory(
    userId: number
): Promise<BorrowingHistoryResponse> {

    return request<BorrowingHistoryResponse>(
        `${API_URL}/users/${userId}/borrowings`
    );
}