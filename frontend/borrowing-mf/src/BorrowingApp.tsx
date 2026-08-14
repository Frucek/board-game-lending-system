import React, { FormEvent, useEffect, useState } from "react";
import { Borrowing, borrowGame, getBorrowings, returnGame } from "./api";

export default function BorrowingApp() {
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [userId, setUserId] = useState("");
    const [gameId, setGameId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadBorrowings() {
        try {
            setLoading(true);
            setError(null);
            setBorrowings(await getBorrowings());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load borrowings");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadBorrowings();
    }, []);

    async function handleBorrow(event: FormEvent) {
        event.preventDefault();

        const user = Number(userId);
        const game = Number(gameId);

        if (!user || !game) {
            setError("User ID and Game ID are required.");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await borrowGame(user, game);
            setUserId("");
            setGameId("");
            await loadBorrowings();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Borrowing failed");
        } finally {
            setSaving(false);
        }
    }

    async function handleReturn(id: number) {
        try {
            setError(null);
            await returnGame(id);
            await loadBorrowings();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Return failed");
        }
    }

    if (loading) return <p>Loading borrowings…</p>;

    return (
        <section>
            <h2>Borrowing</h2>

            {error && (
                <div role="alert">
                    <p>{error}</p>
                    <button type="button" onClick={() => setError(null)}>Close</button>
                </div>
            )}

            <form onSubmit={handleBorrow} style={formStyle}>
                <h3>Borrow Game</h3>

                <input
                    type="number"
                    min={1}
                    placeholder="User ID"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                />
                <input
                    type="number"
                    min={1}
                    placeholder="Game ID"
                    value={gameId}
                    onChange={e => setGameId(e.target.value)}
                />
                <button type="submit" disabled={saving}>
                    {saving ? "Borrowing…" : "Borrow"}
                </button>
            </form>

            <h3>Borrowing History</h3>

            {borrowings.length === 0 && <p>No borrowing records found.</p>}

            {borrowings.map(borrowing => (
                <article key={borrowing.id} style={cardStyle}>
                    <h3>Borrowing #{borrowing.id}</h3>
                    <p>User: {borrowing.userId}</p>
                    <p>Game: {borrowing.gameId}</p>
                    <p>Status: {borrowing.status}</p>
                    <p>Borrowed: {borrowing.borrowedAt}</p>
                    {borrowing.returnedAt && <p>Returned: {borrowing.returnedAt}</p>}

                    {borrowing.status === "ACTIVE" && (
                        <button type="button" onClick={() => void handleReturn(borrowing.id)}>
                            Return
                        </button>
                    )}
                </article>
            ))}
        </section>
    );
}

const formStyle: React.CSSProperties = {
    display: "grid",
    gap: "10px",
    maxWidth: "400px",
    marginBottom: "30px"
};

const cardStyle: React.CSSProperties = {
    background: "white",
    padding: "16px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
};
