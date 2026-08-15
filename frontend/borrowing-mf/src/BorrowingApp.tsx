import React, {
    FormEvent,
    useState
} from "react";

import {
    Borrowing,
    borrowGame,
    getBorrowing,
    getBorrowingHistory,
    returnGame
} from "./api";


export default function BorrowingApp() {

    /*
     * ==========================================
     * BORROW FORM
     * ==========================================
     */

    const [borrowUserId, setBorrowUserId] =
        useState("");

    const [gameId, setGameId] =
        useState("");


    /*
     * ==========================================
     * HISTORY FORM
     * ==========================================
     */

    const [historyUserId, setHistoryUserId] =
        useState("");

    const [borrowings, setBorrowings] =
        useState<Borrowing[]>([]);


    /*
     * ==========================================
     * GET BORROWING FORM
     * ==========================================
     */

    const [lookupId, setLookupId] =
        useState("");

    const [selectedBorrowing, setSelectedBorrowing] =
        useState<Borrowing | null>(null);


    /*
     * ==========================================
     * UI STATE
     * ==========================================
     */

    const [loadingHistory, setLoadingHistory] =
        useState(false);

    const [loadingBorrowing, setLoadingBorrowing] =
        useState(false);

    const [borrowingGame, setBorrowingGame] =
        useState(false);

    const [returningId, setReturningId] =
        useState<number | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);


    /*
     * ==========================================
     * ERROR / SUCCESS
     * ==========================================
     */

    function clearMessages() {

        setError(null);

        setSuccess(null);
    }


    /*
     * ==========================================
     * BORROW GAME
     *
     * POST /borrowings
     * ==========================================
     */

    async function handleBorrow(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        clearMessages();


        const user =
            Number(borrowUserId);

        const game =
            Number(gameId);


        if (
            !Number.isInteger(user) ||
            user <= 0
        ) {

            setError(
                "User ID must be a positive integer."
            );

            return;
        }


        if (
            !Number.isInteger(game) ||
            game <= 0
        ) {

            setError(
                "Game ID must be a positive integer."
            );

            return;
        }


        try {

            setBorrowingGame(true);


            const result =
                await borrowGame(
                    user,
                    game
                );


            setSelectedBorrowing(
                result
            );


            setGameId("");


            setSuccess(
                `Game ${game} successfully borrowed by user ${user}.`
            );


            /*
             * Refresh history automatically.
             */

            setHistoryUserId(
                String(user)
            );


            await loadHistory(user);

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Borrowing failed."
            );

        } finally {

            setBorrowingGame(false);
        }
    }


    /*
     * ==========================================
     * GET BORROWING HISTORY
     *
     * GET /users/:id/borrowings
     * ==========================================
     */

    async function loadHistory(
        explicitUserId?: number
    ) {

        const id =
            explicitUserId ??
            Number(historyUserId);


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

            setLoadingHistory(true);

            clearMessages();


            const result =
                await getBorrowingHistory(id);


            setBorrowings(
                result.borrowings ?? []
            );


            setHistoryUserId(
                String(id)
            );

        } catch (err) {

            setBorrowings([]);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load borrowing history."
            );

        } finally {

            setLoadingHistory(false);
        }
    }


    /*
     * ==========================================
     * GET SINGLE BORROWING
     *
     * GET /borrowings/:id
     * ==========================================
     */

    async function handleGetBorrowing(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        clearMessages();


        const id =
            Number(lookupId);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            setError(
                "Borrowing ID must be a positive integer."
            );

            return;
        }


        try {

            setLoadingBorrowing(true);


            const result =
                await getBorrowing(id);


            setSelectedBorrowing(
                result
            );

            setSuccess(
                `Borrowing #${id} loaded successfully.`
            );

        } catch (err) {

            setSelectedBorrowing(null);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load borrowing."
            );

        } finally {

            setLoadingBorrowing(false);
        }
    }


    /*
     * ==========================================
     * RETURN GAME
     *
     * PUT /borrowings/:id/return
     * ==========================================
     */

    async function handleReturn(
        borrowing: Borrowing
    ) {

        clearMessages();


        if (
            getStatus(borrowing) ===
            "RETURNED"
        ) {

            setError(
                "This borrowing has already been returned."
            );

            return;
        }


        try {

            setReturningId(
                borrowing.id
            );


            const result =
                await returnGame(
                    borrowing.id
                );


            setSelectedBorrowing(
                result
            );


            setSuccess(
                `Borrowing #${borrowing.id} returned successfully.`
            );


            /*
             * Refresh the history of the
             * actual borrowing's user.
             */

            await loadHistory(
                borrowing.user_id
            );

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Return failed."
            );

        } finally {

            setReturningId(null);
        }
    }


    /*
     * ==========================================
     * CLEAR LOOKUP
     * ==========================================
     */

    function clearLookup() {

        setLookupId("");

        setSelectedBorrowing(null);

        clearMessages();
    }


    return (

        <section style={containerStyle}>

            <h2>
                Borrowing Management
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
                SUCCESS
            =================================== */}

            {success && (

                <div
                    role="status"
                    style={successStyle}
                >

                    <strong>
                        Success
                    </strong>

                    <p>
                        {success}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess(null)
                        }
                    >
                        Close
                    </button>

                </div>
            )}


            {/* ==================================
                1. BORROW GAME
                POST /borrowings
            =================================== */}

            <section style={sectionStyle}>

                <h3>
                    1. Borrow Game
                </h3>

                <p style={helpTextStyle}>
                    Creates a new borrowing for a
                    user and game.
                </p>


                <form
                    onSubmit={handleBorrow}
                    style={formStyle}
                >

                    <label>
                        User ID

                        <input
                            type="number"
                            min={1}
                            placeholder="User ID"
                            value={borrowUserId}
                            onChange={event =>
                                setBorrowUserId(
                                    event.target.value
                                )
                            }
                        />
                    </label>


                    <label>
                        Game ID

                        <input
                            type="number"
                            min={1}
                            placeholder="Game ID"
                            value={gameId}
                            onChange={event =>
                                setGameId(
                                    event.target.value
                                )
                            }
                        />
                    </label>


                    <button
                        type="submit"
                        disabled={borrowingGame}
                    >

                        {borrowingGame
                            ? "Borrowing..."
                            : "Borrow Game"}

                    </button>

                </form>

            </section>


            {/* ==================================
                2. BORROWING HISTORY
                GET /users/:id/borrowings
            =================================== */}

            <section style={sectionStyle}>

                <h3>
                    2. Borrowing History
                </h3>

                <p style={helpTextStyle}>
                    Shows all borrowings belonging
                    to a specific user.
                </p>


                <form
                    onSubmit={event => {

                        event.preventDefault();

                        void loadHistory();

                    }}
                    style={inlineFormStyle}
                >

                    <label>
                        User ID

                        <input
                            type="number"
                            min={1}
                            placeholder="User ID"
                            value={historyUserId}
                            onChange={event =>
                                setHistoryUserId(
                                    event.target.value
                                )
                            }
                        />
                    </label>


                    <button
                        type="submit"
                        disabled={loadingHistory}
                    >

                        {loadingHistory
                            ? "Loading..."
                            : "Load History"}

                    </button>

                </form>


                {borrowings.length === 0 && (

                    <p>
                        No borrowing records found.
                    </p>
                )}


                {borrowings.map(
                    borrowing => (

                        <BorrowingCard
                            key={borrowing.id}
                            borrowing={borrowing}
                            returningId={returningId}
                            onReturn={
                                handleReturn
                            }
                        />
                    )
                )}

            </section>


            {/* ==================================
                3. GET SINGLE BORROWING
                GET /borrowings/:id
            =================================== */}

            <section style={sectionStyle}>

                <h3>
                    3. Find Borrowing
                </h3>

                <p style={helpTextStyle}>
                    Retrieves one borrowing by its ID.
                </p>


                <form
                    onSubmit={
                        handleGetBorrowing
                    }
                    style={inlineFormStyle}
                >

                    <label>
                        Borrowing ID

                        <input
                            type="number"
                            min={1}
                            placeholder="Borrowing ID"
                            value={lookupId}
                            onChange={event =>
                                setLookupId(
                                    event.target.value
                                )
                            }
                        />
                    </label>


                    <button
                        type="submit"
                        disabled={loadingBorrowing}
                    >

                        {loadingBorrowing
                            ? "Loading..."
                            : "Get Borrowing"}

                    </button>


                    {selectedBorrowing && (

                        <button
                            type="button"
                            onClick={
                                clearLookup
                            }
                        >
                            Clear
                        </button>
                    )}

                </form>


                {selectedBorrowing && (

                    <BorrowingCard
                        borrowing={
                            selectedBorrowing
                        }
                        returningId={
                            returningId
                        }
                        onReturn={
                            handleReturn
                        }
                    />
                )}

            </section>

        </section>
    );
}


/*
 * ==========================================
 * BORROWING CARD
 * ==========================================
 */

interface BorrowingCardProps {

    borrowing: Borrowing;

    returningId: number | null;

    onReturn: (
        borrowing: Borrowing
    ) => Promise<void>;
}


function BorrowingCard({
    borrowing,
    returningId,
    onReturn
}: BorrowingCardProps) {

    const status =
        getStatus(borrowing);


    const isReturned =
        status === "RETURNED";


    return (

        <article
            style={cardStyle}
        >

            <div
                style={cardHeaderStyle}
            >

                <h4>
                    Borrowing #{borrowing.id}
                </h4>


                <span
                    style={
                        isReturned
                            ? returnedBadgeStyle
                            : activeBadgeStyle
                    }
                >
                    {status}
                </span>

            </div>


            <p>
                <strong>
                    User:
                </strong>{" "}
                {borrowing.user_id}
            </p>


            <p>
                <strong>
                    Game:
                </strong>{" "}
                {borrowing.game_id}
            </p>


            <p>
                <strong>
                    Borrowed:
                </strong>{" "}
                {formatDate(
                    borrowing.borrowed_at
                )}
            </p>


            {borrowing.returned_at && (

                <p>
                    <strong>
                        Returned:
                    </strong>{" "}
                    {formatDate(
                        borrowing.returned_at
                    )}
                </p>
            )}


            {!isReturned && (

                <button
                    type="button"
                    disabled={
                        returningId ===
                        borrowing.id
                    }
                    onClick={() =>
                        void onReturn(
                            borrowing
                        )
                    }
                >

                    {returningId ===
                    borrowing.id
                        ? "Returning..."
                        : "Return Game"}

                </button>
            )}

        </article>
    );
}


/*
 * ==========================================
 * STATUS NORMALIZATION
 * ==========================================
 */

function getStatus(
    borrowing: Borrowing
): "ACTIVE" | "RETURNED" {

    const status =
        String(
            borrowing.status
        ).toUpperCase();


    if (
        status ===
        "BORROWING_STATUS_RETURNED" ||
        status === "RETURNED" ||
        status === "2"
    ) {

        return "RETURNED";
    }


    if (
        status ===
        "BORROWING_STATUS_BORROWED" ||
        status === "BORROWED" ||
        status === "ACTIVE" ||
        status === "1"
    ) {

        return "ACTIVE";
    }


    /*
     * Unknown statuses are treated as active
     * so that the user does not accidentally
     * lose access to the Return operation.
     */

    return "ACTIVE";
}


/*
 * ==========================================
 * DATE FORMATTING
 * ==========================================
 */

function formatDate(
    value: string
): string {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;
    }


    return date.toLocaleString();
}


/*
 * ==========================================
 * STYLES
 * ==========================================
 */

const containerStyle:
    React.CSSProperties = {

    maxWidth: "900px",

    margin: "0 auto",

    padding: "20px"
};


const descriptionStyle:
    React.CSSProperties = {

    color: "#6b7280",

    marginBottom: "30px"
};


const sectionStyle:
    React.CSSProperties = {

    marginTop: "35px",

    paddingTop: "10px"
};


const formStyle:
    React.CSSProperties = {

    display: "grid",

    gap: "12px",

    maxWidth: "500px",

    padding: "20px",

    border:
        "1px solid #e5e7eb",

    borderRadius: "10px"
};


const inlineFormStyle:
    React.CSSProperties = {

    display: "flex",

    alignItems: "end",

    gap: "10px",

    flexWrap: "wrap",

    marginBottom: "20px"
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

    alignItems: "center",

    gap: "10px"
};


const activeBadgeStyle:
    React.CSSProperties = {

    padding: "5px 10px",

    borderRadius: "999px",

    background: "#dcfce7"
};


const returnedBadgeStyle:
    React.CSSProperties = {

    padding: "5px 10px",

    borderRadius: "999px",

    background: "#e5e7eb"
};


const helpTextStyle:
    React.CSSProperties = {

    color: "#6b7280"
};


const errorStyle:
    React.CSSProperties = {

    padding: "15px",

    marginBottom: "20px",

    border:
        "1px solid #ef4444",

    borderRadius: "8px",

    background: "#fef2f2"
};


const successStyle:
    React.CSSProperties = {

    padding: "15px",

    marginBottom: "20px",

    border:
        "1px solid #22c55e",

    borderRadius: "8px",

    background: "#f0fdf4"
};


const summaryStyle:
    React.CSSProperties = {

    marginTop: "40px",

    padding: "20px",

    border:
        "1px solid #e5e7eb",

    borderRadius: "10px"
};