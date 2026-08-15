import React, {
    FormEvent,
    useEffect,
    useState
} from "react";

import {
    Game,
    GameInput,
    createGame,
    deleteGame,
    getGame,
    getGames,
    updateGame
} from "./api";


const emptyForm: GameInput = {
    name: "",
    description: "",
    category: "",
    minPlayers: 1,
    maxPlayers: 4,
    difficulty: "MEDIUM"
};


export default function CatalogApp() {

    const [games, setGames] =
        useState<Game[]>([]);

    const [form, setForm] =
        useState<GameInput>({
            ...emptyForm
        });

    const [editing, setEditing] =
        useState<Game | null>(null);

    const [lookupId, setLookupId] =
        useState("");

    const [lookupResult, setLookupResult] =
        useState<Game | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);


    // ==========================================
    // LOAD GAMES
    // ==========================================

    async function loadGames() {

        try {

            setLoading(true);
            setError(null);

            const result =
                await getGames();

            setGames(result);

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load games."
            );

        } finally {

            setLoading(false);
        }
    }


    useEffect(() => {
        void loadGames();
    }, []);


    // ==========================================
    // FORM
    // ==========================================

    function resetForm() {

        setEditing(null);

        setForm({
            ...emptyForm
        });
    }


    function startEdit(game: Game) {

        setEditing(game);

        setForm({
            name: game.name,

            description:
                game.description ?? "",

            category:
                game.category,

            minPlayers:
                Number(game.minPlayers),

            maxPlayers:
                Number(game.maxPlayers),

            difficulty:
                normalizeDifficulty(
                    game.difficulty
                )
        });

        setError(null);
    }


    function updateField(
        field: keyof GameInput,
        value: string | number
    ) {

        setForm(previous => ({
            ...previous,
            [field]: value
        }));
    }


    // ==========================================
    // VALIDATION
    // ==========================================

    function validateForm(): string | null {

        if (!form.name.trim()) {
            return "Game name is required.";
        }

        if (!form.category.trim()) {
            return "Category is required.";
        }

        if (
            !Number.isInteger(
                Number(form.minPlayers)
            ) ||
            Number(form.minPlayers) < 1
        ) {
            return "Minimum players must be at least 1.";
        }

        if (
            !Number.isInteger(
                Number(form.maxPlayers)
            ) ||
            Number(form.maxPlayers) < 1
        ) {
            return "Maximum players must be at least 1.";
        }

        if (
            Number(form.maxPlayers) <
            Number(form.minPlayers)
        ) {
            return "Maximum players cannot be smaller than minimum players.";
        }

        if (!form.difficulty) {
            return "Difficulty is required.";
        }

        return null;
    }


    // ==========================================
    // CREATE / UPDATE
    // ==========================================

    async function handleSubmit(
        event: FormEvent
    ) {

        event.preventDefault();

        const validationError =
            validateForm();

        if (validationError) {

            setError(validationError);

            return;
        }


        /*
         * IMPORTANT:
         *
         * This is exactly the object expected
         * by the BFF.
         */
        const gameData: GameInput = {

            name:
                form.name.trim(),

            description:
                form.description.trim(),

            category:
                form.category.trim(),

            minPlayers:
                Number(form.minPlayers),

            maxPlayers:
                Number(form.maxPlayers),

            difficulty:
                normalizeDifficulty(
                    form.difficulty
                )
        };


        console.log(
            "Catalog request:",
            gameData
        );


        try {

            setSaving(true);
            setError(null);


            if (editing) {

                await updateGame(
                    editing.id,
                    gameData
                );

            } else {

                await createGame(
                    gameData
                );
            }


            resetForm();

            await loadGames();

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save game."
            );

        } finally {

            setSaving(false);
        }
    }


    // ==========================================
    // DELETE
    // ==========================================

    async function handleDelete(
        id: number
    ) {

        if (
            !window.confirm(
                "Are you sure you want to delete this game?"
            )
        ) {
            return;
        }


        try {

            setError(null);

            await deleteGame(id);


            if (
                lookupResult?.id === id
            ) {
                setLookupResult(null);
            }


            if (
                editing?.id === id
            ) {
                resetForm();
            }


            await loadGames();

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete game."
            );
        }
    }


    // ==========================================
    // GET ONE
    // ==========================================

    async function handleLookup(
        event: FormEvent
    ) {

        event.preventDefault();

        const id =
            Number(lookupId);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            setError(
                "Game ID must be a positive integer."
            );

            return;
        }


        try {

            setError(null);

            const result =
                await getGame(id);

            setLookupResult(result);

        } catch (err) {

            setLookupResult(null);

            setError(
                err instanceof Error
                    ? err.message
                    : "Game lookup failed."
            );
        }
    }


    if (loading) {

        return (
            <section>

                <h2>
                    Game Catalog
                </h2>

                <p>
                    Loading games...
                </p>

            </section>
        );
    }


    return (
        <section>

            <h2>
                Game Catalog
            </h2>


            {/* =================================
                ERROR
            ================================== */}

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


            {/* =================================
                CREATE / UPDATE
            ================================== */}

            <form
                onSubmit={handleSubmit}
                style={formStyle}
            >

                <h3>
                    {editing
                        ? "Update Game"
                        : "Add Game"}
                </h3>


                <label>
                    Name

                    <input
                        type="text"
                        value={form.name}
                        placeholder="Catan"
                        onChange={event =>
                            updateField(
                                "name",
                                event.target.value
                            )
                        }
                    />

                </label>


                <label>
                    Description

                    <textarea
                        value={
                            form.description
                        }
                        placeholder="Game description"
                        rows={3}
                        onChange={event =>
                            updateField(
                                "description",
                                event.target.value
                            )
                        }
                    />

                </label>


                <label>
                    Category

                    <input
                        type="text"
                        value={
                            form.category
                        }
                        placeholder="Strategy"
                        onChange={event =>
                            updateField(
                                "category",
                                event.target.value
                            )
                        }
                    />

                </label>


                <label>
                    Minimum Players

                    <input
                        type="number"
                        min={1}
                        value={
                            form.minPlayers
                        }
                        onChange={event =>
                            updateField(
                                "minPlayers",
                                Number(
                                    event.target.value
                                )
                            )
                        }
                    />

                </label>


                <label>
                    Maximum Players

                    <input
                        type="number"
                        min={1}
                        value={
                            form.maxPlayers
                        }
                        onChange={event =>
                            updateField(
                                "maxPlayers",
                                Number(
                                    event.target.value
                                )
                            )
                        }
                    />

                </label>


                <label>
                    Difficulty

                    <select
                        value={
                            form.difficulty
                        }
                        onChange={event =>
                            updateField(
                                "difficulty",
                                event.target.value
                            )
                        }
                    >

                        <option value="EASY">
                            Easy
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HARD">
                            Hard
                        </option>

                    </select>

                </label>


                <div
                    style={buttonRowStyle}
                >

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : editing
                                ? "Update Game"
                                : "Add Game"}
                    </button>


                    {editing && (

                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                setError(null);
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    )}

                </div>

            </form>


            {/* =================================
                GET GAME
            ================================== */}

            <form
                onSubmit={handleLookup}
                style={formStyle}
            >

                <h3>
                    Find Game by ID
                </h3>


                <label>
                    Game ID

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


                <button type="submit">
                    Find Game
                </button>

            </form>


            {lookupResult && (

                <article
                    style={cardStyle}
                >

                    <h3>
                        Lookup Result
                    </h3>

                    <GameDetails
                        game={lookupResult}
                    />

                </article>
            )}


            {/* =================================
                GAME LIST
            ================================== */}

            <section>

                <div
                    style={headingStyle}
                >

                    <h3>
                        Games
                    </h3>

                    <button
                        type="button"
                        onClick={() =>
                            void loadGames()
                        }
                    >
                        Refresh
                    </button>

                </div>


                {games.length === 0 && (

                    <p>
                        No games found.
                    </p>
                )}


                {games.map(game => (

                    <article
                        key={game.id}
                        style={cardStyle}
                    >

                        <h3>
                            {game.name}
                        </h3>

                        <GameDetails
                            game={game}
                        />

                        <div
                            style={buttonRowStyle}
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    startEdit(game)
                                }
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleDelete(
                                        game.id
                                    )
                                }
                            >
                                Delete
                            </button>

                        </div>

                    </article>
                ))}

            </section>

        </section>
    );
}


/**
 * Convert whatever the backend returns
 * into the enum format expected when
 * sending data back.
 */
function normalizeDifficulty(
    value: string
): string {

    const normalized =
        value
            .trim()
            .toUpperCase();

    switch (normalized) {

        case "EASY":
            return "EASY";

        case "MEDIUM":
            return "MEDIUM";

        case "HARD":
            return "HARD";

        default:
            return normalized;
    }
}


/**
 * Display game information.
 */
function GameDetails({
    game
}: {
    game: Game;
}) {

    return (
        <div>

            <p>
                <strong>
                    ID:
                </strong>{" "}
                {game.id}
            </p>


            {game.description && (

                <p>
                    <strong>
                        Description:
                    </strong>{" "}
                    {game.description}
                </p>
            )}


            <p>
                <strong>
                    Category:
                </strong>{" "}
                {game.category}
            </p>


            <p>
                <strong>
                    Players:
                </strong>{" "}
                {game.minPlayers}
                {" - "}
                {game.maxPlayers}
            </p>


            <p>
                <strong>
                    Difficulty:
                </strong>{" "}
                {formatDifficulty(
                    game.difficulty
                )}
            </p>


            {game.available !== undefined && (

                <p>
                    <strong>
                        Status:
                    </strong>{" "}
                    {game.available
                        ? "Available"
                        : "Borrowed"}
                </p>
            )}

        </div>
    );
}


function formatDifficulty(
    value: string
): string {

    switch (
        value.toUpperCase()
    ) {

        case "EASY":
            return "Easy";

        case "MEDIUM":
            return "Medium";

        case "HARD":
            return "Hard";

        default:
            return value;
    }
}


/* ==========================================
   STYLES
========================================== */

const formStyle:
    React.CSSProperties = {

    display: "grid",

    gap: "12px",

    maxWidth: "550px",

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


const buttonRowStyle:
    React.CSSProperties = {

    display: "flex",

    gap: "10px",

    marginTop: "10px"
};


const headingStyle:
    React.CSSProperties = {

    display: "flex",

    justifyContent:
        "space-between",

    alignItems: "center",

    maxWidth: "550px"
};


const errorStyle:
    React.CSSProperties = {

    padding: "15px",

    marginBottom: "20px",

    border:
        "1px solid #ef4444",

    borderRadius: "8px",

    maxWidth: "550px"
};