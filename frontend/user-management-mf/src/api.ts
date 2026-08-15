export type UserStatus =
    | "ACTIVE"
    | "SUSPENDED";


export interface User {
    id: number;
    name: string;
    email: string;
    status: UserStatus;
    borrowingLimit: number;
}


export interface CreateUserRequest {
    name: string;
    email: string;
}


const API_URL = "/api/web";


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


/*
 * ==========================================
 * GET ALL USERS
 * GET /api/web/users
 * ==========================================
 */

export function getUsers(): Promise<User[]> {

    return request<User[]>(
        `${API_URL}/users`
    );
}


/*
 * ==========================================
 * GET ONE USER
 * GET /api/web/users/:id
 * ==========================================
 */

export function getUser(
    id: number
): Promise<User> {

    return request<User>(
        `${API_URL}/users/${id}`
    );
}


/*
 * ==========================================
 * CREATE USER
 * POST /api/web/users
 * ==========================================
 */

export function createUser(
    user: CreateUserRequest
): Promise<User> {

    return request<User>(
        `${API_URL}/users`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(user)
        }
    );
}


/*
 * ==========================================
 * UPDATE USER STATUS
 * PUT /api/web/users/:id/status
 * ==========================================
 */

export function updateUserStatus(
    id: number,
    status: UserStatus
): Promise<User> {

    return request<User>(
        `${API_URL}/users/${id}/status`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                status
            })
        }
    );
}


/*
 * ==========================================
 * DELETE USER
 * DELETE /api/web/users/:id
 * ==========================================
 */

export function deleteUser(
    id: number
): Promise<void> {

    return request<void>(
        `${API_URL}/users/${id}`,
        {
            method: "DELETE"
        }
    );
}