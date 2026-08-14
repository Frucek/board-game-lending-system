import React, { FormEvent, useEffect, useState } from "react";
import { Game, createGame, deleteGame, getGame, getGames, updateGame } from "./api";

const emptyForm = {
    name: "",
    category: "",
    players: "",
    difficulty: "Medium",
    available: true
};

export default function CatalogApp() {
    const [games, setGames] = useState<Game[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState<Game | null>(null);
    const [lookupId, setLookupId] = useState("");
    const [lookupResult, setLookupResult] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadGames() {
        try {
            setLoading(true);
            setError(null);
            setGames(await getGames());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load games");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadGames();
    }, []);

    function resetForm() {
        setEditing(null);
        setForm(emptyForm);
    }

    function startEdit(game: Game) {
        setEditing(game);
        setForm({
            name: game.name,
            category: game.category,
            players: game.players,
            difficulty: game.difficulty,
            available: game.available
        });
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (!form.name.trim() || !form.category.trim() || !form.players.trim()) {
            setError("Name, category and players are required.");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            if (editing) {
                await updateGame(editing.id, form);
            } else {
                await createGame(form);
            }

            resetForm();
            await loadGames();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save game");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Delete this game?")) return;

        try {
            setError(null);
            await deleteGame(id);
            if (lookupResult?.id === id) setLookupResult(null);
            await loadGames();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete game");
        }
    }

    async function handleLookup(event: FormEvent) {
        event.preventDefault();

        if (!lookupId) return;

        try {
            setError(null);
            setLookupResult(await getGame(Number(lookupId)));
        } catch (err) {
            setLookupResult(null);
            setError(err instanceof Error ? err.message : "Game lookup failed");
        }
    }

    if (loading) return <p>Loading games…</p>;

    return (
        <section>
            <h2>Game Catalog</h2>

            {error && (
                <div role="alert">
                    <p>{error}</p>
                    <button type="button" onClick={() => setError(null)}>Close</button>
                </div>
            )}

            <form onSubmit={handleSubmit} style={formStyle}>
                <h3>{editing ? "Edit Game" : "Add Game"}</h3>

                <input
                    placeholder="Game name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <input
                    placeholder="Category"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                />
                <input
                    placeholder="Players (e.g. 2-4)"
                    value={form.players}
                    onChange={e => setForm({ ...form, players: e.target.value })}
                />
                <select
                    value={form.difficulty}
                    onChange={e => setForm({ ...form, difficulty: e.target.value })}
                >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>
                <label>
                    <input
                        type="checkbox"
                        checked={form.available}
                        onChange={e => setForm({ ...form, available: e.target.checked })}
                    />
                    Available
                </label>

                <div>
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving…" : editing ? "Save Changes" : "Add Game"}
                    </button>
                    {editing && (
                        <button type="button" onClick={resetForm}>Cancel</button>
                    )}
                </div>
            </form>

            <form onSubmit={handleLookup} style={formStyle}>
                <h3>Find Game by ID</h3>
                <input
                    type="number"
                    min={1}
                    placeholder="Game ID"
                    value={lookupId}
                    onChange={e => setLookupId(e.target.value)}
                />
                <button type="submit">Find Game</button>
            </form>

            {lookupResult && (
                <article style={cardStyle}>
                    <h3>Lookup result: {lookupResult.name}</h3>
                    <p>ID: {lookupResult.id}</p>
                    <p>Category: {lookupResult.category}</p>
                    <p>Players: {lookupResult.players}</p>
                    <p>Difficulty: {lookupResult.difficulty}</p>
                    <p>{lookupResult.available ? "Available" : "Borrowed"}</p>
                </article>
            )}

            <h3>Games</h3>

            {games.length === 0 && <p>No games found.</p>}

            {games.map(game => (
                <article key={game.id} style={cardStyle}>
                    <h3>{game.name}</h3>
                    <p>ID: {game.id}</p>
                    <p>Category: {game.category}</p>
                    <p>Players: {game.players}</p>
                    <p>Difficulty: {game.difficulty}</p>
                    <p>Status: {game.available ? "Available" : "Borrowed"}</p>
                    <button type="button" onClick={() => startEdit(game)}>Edit</button>
                    <button type="button" onClick={() => void handleDelete(game.id)}>Delete</button>
                </article>
            ))}
        </section>
    );
}

const formStyle: React.CSSProperties = {
    display: "grid",
    gap: "10px",
    maxWidth: "520px",
    marginBottom: "30px"
};

const cardStyle: React.CSSProperties = {
    background: "white",
    padding: "18px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
};
