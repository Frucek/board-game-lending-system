import React, {
    FormEvent,
    useEffect,
    useState
} from "react";

import {
    User,
    UserStatus,
    createUser,
    getUsers,
    updateUserStatus
} from "./api";

const emptyForm = {
    name: "",
    email: ""
};

export default function UsersApp() {
    const [users, setUsers] = useState<User[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadUsers() {
        try {
            setLoading(true);
            setError(null);

            const result = await getUsers();
            setUsers(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadUsers();
    }, []);

    function startEdit(user: User) {
        setEditing(user);

        setForm({
            name: user.name,
            email: user.email
        });
    }

    function resetForm() {
        setEditing(null);
        setForm(emptyForm);
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (
            !form.name.trim() ||
            !form.email.trim()
        ) {
            setError(
                "Name and email are required."
            );

            return;
        }

        try {
            setSaving(true);
            setError(null);

            if (editing) {
                /*
                 * Your backend does not expose
                 * PUT /users/:id for editing name/email.
                 *
                 * It only exposes:
                 * PUT /users/:id/status
                 *
                 * Therefore editing here only changes
                 * the user's status through the existing API.
                 */
                await updateUserStatus(
                    editing.id,
                    editing.status
                );
            } else {
                await createUser({
                    name: form.name.trim(),
                    email: form.email.trim()
                });
            }

            resetForm();
            await loadUsers();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save user"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleStatusChange(
        user: User,
        status: UserStatus
    ) {
        try {
            setError(null);

            await updateUserStatus(
                user.id,
                status
            );

            await loadUsers();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update status"
            );
        }
    }

    if (loading) {
        return <p>Loading users...</p>;
    }

    return (
        <section>
            <h2>User Management</h2>

            {error && (
                <div role="alert">
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            setError(null)
                        }
                    >
                        Close
                    </button>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                style={formStyle}
            >
                <h3>
                    {editing
                        ? "User Details"
                        : "Create User"}
                </h3>

                <input
                    placeholder="Name"
                    value={form.name}
                    onChange={event =>
                        setForm({
                            ...form,
                            name: event.target.value
                        })
                    }
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={event =>
                        setForm({
                            ...form,
                            email: event.target.value
                        })
                    }
                />

                {!editing && (
                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Creating..."
                            : "Create User"}
                    </button>
                )}

                {editing && (
                    <button
                        type="button"
                        onClick={resetForm}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <h3>Users</h3>

            {users.length === 0 && (
                <p>No users found.</p>
            )}

            {users.map(user => (
                <article
                    key={user.id}
                    style={cardStyle}
                >
                    <h3>{user.name}</h3>

                    <p>
                        ID: {user.id}
                    </p>

                    <p>
                        Email: {user.email}
                    </p>

                    <p>
                        Status: {user.status}
                    </p>

                    <p>
                        Borrowing limit:{" "}
                        {user.borrowingLimit}
                    </p>

                    <div>
                        <button
                            type="button"
                            onClick={() =>
                                startEdit(user)
                            }
                        >
                            Edit
                        </button>
                    </div>

                    <div
                        style={{
                            marginTop: "10px"
                        }}
                    >
                        <label>
                            Status:{" "}
                            <select
                                value={user.status}
                                onChange={event =>
                                    handleStatusChange(
                                        user,
                                        event.target
                                            .value as UserStatus
                                    )
                                }
                            >
                                <option value="ACTIVE">
                                    ACTIVE
                                </option>

                                <option value="SUSPENDED">
                                    SUSPENDED
                                </option>
                            </select>
                        </label>
                    </div>
                </article>
            ))}
        </section>
    );
}

const formStyle: React.CSSProperties = {
    display: "grid",
    gap: "10px",
    maxWidth: "500px",
    marginBottom: "30px"
};

const cardStyle: React.CSSProperties = {
    background: "white",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
};