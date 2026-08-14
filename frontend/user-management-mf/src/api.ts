export type UserStatus = "ACTIVE" | "SUSPENDED";

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
    const response = await fetch(url, options);

    if (!response.ok) {
        const message = await response.text();

        throw new Error(
            message || `Request failed (${response.status})`
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export function getUsers(): Promise<User[]> {
    return request<User[]>(
        `${API_URL}/users`
    );
}

export function createUser(
    user: CreateUserRequest
): Promise<User> {
    return request<User>(
        `${API_URL}/users`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        }
    );
}

export function updateUserStatus(
    id: number,
    status: UserStatus
): Promise<User> {
    return request<User>(
        `${API_URL}/users/${id}/status`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        }
    );
}