import React, {
    FormEvent,
    useEffect,
    useState
} from "react";

import {
    User,
    UserStatus,
    createUser,
    deleteUser,
    getUser,
    getUsers,
    updateUserStatus
} from "./api";


const emptyForm = {
    name: "",
    email: ""
};


export default function UsersApp() {

    const [users, setUsers] =
        useState<User[]>([]);

    const [form, setForm] =
        useState(emptyForm);

    const [lookupId, setLookupId] =
        useState("");

    const [lookupResult, setLookupResult] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);


    /*
     * ==========================================
     * LOAD USERS
     * ==========================================
     */

    async function loadUsers() {

        try {

            setLoading(true);

            setError(null);

            const result =
                await getUsers();

            setUsers(result);

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load users."
            );

        } finally {

            setLoading(false);
        }
    }


    /*
     * Load users when MF starts
     */

    useEffect(() => {

        void loadUsers();

    }, []);


    /*
     * ==========================================
     * CREATE USER
     * ==========================================
     */

    async function handleCreateUser(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        const name =
            form.name.trim();

        const email =
            form.email.trim();


        if (!name || !email) {

            setError(
                "Name and email are required."
            );

            return;
        }


        /*
         * Basic browser-side email validation.
         */

        if (
            !email.includes("@") ||
            !email.includes(".")
        ) {

            setError(
                "Please enter a valid email address."
            );

            return;
        }


        try {

            setSaving(true);

            setError(null);


            await createUser({
                name,
                email
            });


            setForm({
                ...emptyForm
            });


            await loadUsers();

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create user."
            );

        } finally {

            setSaving(false);
        }
    }


    /*
     * ==========================================
     * GET USER BY ID
     * ==========================================
     */

    async function handleLookup(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        const id =
            Number(lookupId);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            setError(
                "User ID must be a positive integer."
            );

            return;
        }


        try {

            setError(null);

            const result =
                await getUser(id);

            setLookupResult(result);

        } catch (err) {

            setLookupResult(null);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to find user."
            );
        }
    }


    /*
     * ==========================================
     * UPDATE STATUS
     * ==========================================
     */

    async function handleStatusChange(
        user: User,
        status: UserStatus
    ) {

        /*
         * Don't send a request if the status
         * didn't actually change.
         */

        if (
            user.status === status
        ) {
            return;
        }


        try {

            setError(null);

            await updateUserStatus(
                user.id,
                status
            );


            /*
             * If the currently displayed
             * lookup result is the same user,
             * update it too.
             */

            if (
                lookupResult &&
                lookupResult.id === user.id
            ) {

                setLookupResult({
                    ...lookupResult,
                    status
                });
            }


            await loadUsers();

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update user status."
            );
        }
    }


    /*
     * ==========================================
     * DELETE USER
     * ==========================================
     */

    async function handleDelete(
        user: User
    ) {

        const confirmed =
            window.confirm(
                `Delete user "${user.name}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setError(null);


            await deleteUser(
                user.id
            );


            /*
             * Remove lookup result if it
             * was the deleted user.
             */

            if (
                lookupResult &&
                lookupResult.id === user.id
            ) {

                setLookupResult(null);
            }


            await loadUsers();

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete user."
            );
        }
    }


    /*
     * ==========================================
     * CLEAR LOOKUP
     * ==========================================
     */

    function clearLookup() {

        setLookupResult(null);

        setLookupId("");

        setError(null);
    }


    /*
     * ==========================================
     * LOADING
     * ==========================================
     */

    if (loading) {

        return (
            <section>

                <h2>
                    User Management
                </h2>

                <p>
                    Loading users...
                </p>

            </section>
        );
    }


    /*
     * ==========================================
     * UI
     * ==========================================
     */

    return (
        <section>

            <h2>
                User Management
            </h2>


            {/* ==================================
                ERROR
            =================================== */}

            {error && (

                <div
                    role="alert"
                    style={errorStyle}
                >

                    <strong>
                        Error
                    </strong>

                    <p>
                        {error}
                    </p>

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


            {/* ==================================
                CREATE USER
            =================================== */}

            <form
                onSubmit={handleCreateUser}
                style={formStyle}
            >

                <h3>
                    Create User
                </h3>


                <label>
                    Name

                    <input
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={event =>
                            setForm({
                                ...form,
                                name:
                                    event.target.value
                            })
                        }
                    />

                </label>


                <label>
                    Email

                    <input
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={event =>
                            setForm({
                                ...form,
                                email:
                                    event.target.value
                            })
                        }
                    />

                </label>


                <button
                    type="submit"
                    disabled={saving}
                >

                    {saving
                        ? "Creating..."
                        : "Create User"}

                </button>

            </form>


            {/* ==================================
                GET USER BY ID
            =================================== */}

            <form
                onSubmit={handleLookup}
                style={formStyle}
            >

                <h3>
                    Find User by ID
                </h3>


                <label>
                    User ID

                    <input
                        type="number"
                        min={1}
                        placeholder="1"
                        value={lookupId}
                        onChange={event =>
                            setLookupId(
                                event.target.value
                            )
                        }
                    />

                </label>


                <div
                    style={buttonRowStyle}
                >

                    <button
                        type="submit"
                    >
                        Find User
                    </button>


                    {lookupResult && (

                        <button
                            type="button"
                            onClick={
                                clearLookup
                            }
                        >
                            Clear
                        </button>
                    )}

                </div>

            </form>


            {/* ==================================
                LOOKUP RESULT
            =================================== */}

            {lookupResult && (

                <section>

                    <h3>
                        User Lookup Result
                    </h3>


                    <UserCard
                        user={lookupResult}
                        onStatusChange={
                            handleStatusChange
                        }
                        onDelete={
                            handleDelete
                        }
                    />

                </section>
            )}


            {/* ==================================
                ALL USERS
            =================================== */}

            <section>

                <div
                    style={headingStyle}
                >

                    <h3>
                        Users
                    </h3>


                    <button
                        type="button"
                        onClick={() =>
                            void loadUsers()
                        }
                    >
                        Refresh
                    </button>

                </div>


                {users.length === 0 && (

                    <p>
                        No users found.
                    </p>
                )}


                {users.map(user => (

                    <UserCard
                        key={user.id}
                        user={user}
                        onStatusChange={
                            handleStatusChange
                        }
                        onDelete={
                            handleDelete
                        }
                    />
                ))}

            </section>

        </section>
    );
}


/*
 * ==========================================
 * USER CARD
 * ==========================================
 */

interface UserCardProps {

    user: User;

    onStatusChange: (
        user: User,
        status: UserStatus
    ) => Promise<void>;

    onDelete: (
        user: User
    ) => Promise<void>;
}


function UserCard({
    user,
    onStatusChange,
    onDelete
}: UserCardProps) {

    return (
        <article
            style={cardStyle}
        >

            <div
                style={cardHeaderStyle}
            >

                <h3>
                    {user.name}
                </h3>


                <span
                    style={
                        user.status === "ACTIVE"
                            ? activeStyle
                            : suspendedStyle
                    }
                >
                    {user.status}
                </span>

            </div>


            <p>
                <strong>
                    ID:
                </strong>{" "}
                {user.id}
            </p>


            <p>
                <strong>
                    Email:
                </strong>{" "}
                {user.email}
            </p>


            <p>
                <strong>
                    Borrowing limit:
                </strong>{" "}
                {user.borrowingLimit}
            </p>


            {/* STATUS */}

            <div
                style={statusRowStyle}
            >

                <label>
                    Status:{" "}

                    <select
                        value={user.status}
                        onChange={event =>
                            void onStatusChange(
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


            {/* DELETE */}

            <div
                style={buttonRowStyle}
            >

                <button
                    type="button"
                    onClick={() =>
                        void onDelete(user)
                    }
                >
                    Delete User
                </button>

            </div>

        </article>
    );
}


/*
 * ==========================================
 * STYLES
 * ==========================================
 */

const formStyle:
    React.CSSProperties = {

    display: "grid",

    gap: "12px",

    maxWidth: "500px",

    marginBottom: "30px",

    padding: "20px",

    border:
        "1px solid #e5e7eb",

    borderRadius: "10px"
};


const cardStyle:
    React.CSSProperties = {

    background: "white",

    padding: "18px",

    marginBottom: "12px",

    borderRadius: "10px",

    border:
        "1px solid #e5e7eb"
};


const cardHeaderStyle:
    React.CSSProperties = {

    display: "flex",

    justifyContent:
        "space-between",

    alignItems: "center"
};


const headingStyle:
    React.CSSProperties = {

    display: "flex",

    justifyContent:
        "space-between",

    alignItems: "center",

    maxWidth: "500px"
};


const buttonRowStyle:
    React.CSSProperties = {

    display: "flex",

    gap: "10px",

    marginTop: "10px"
};


const statusRowStyle:
    React.CSSProperties = {

    marginTop: "15px"
};


const activeStyle:
    React.CSSProperties = {

    padding: "4px 8px",

    borderRadius: "5px",

    background: "#dcfce7"
};


const suspendedStyle:
    React.CSSProperties = {

    padding: "4px 8px",

    borderRadius: "5px",

    background: "#fee2e2"
};


const errorStyle:
    React.CSSProperties = {

    padding: "15px",

    marginBottom: "20px",

    border:
        "1px solid #ef4444",

    borderRadius: "8px",

    maxWidth: "500px"
};