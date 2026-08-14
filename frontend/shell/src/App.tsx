import React, { Suspense, useState } from "react";

const CatalogApp = React.lazy(() => import("catalog/CatalogApp"));
const BorrowingApp = React.lazy(() => import("borrowing/BorrowingApp"));
const UsersApp = React.lazy(() => import("users/UsersApp"));

type Page = "catalog" | "borrowing" | "users";

export default function App() {
    const [page, setPage] = useState<Page>("catalog");

    return (
        <div className="app">
            <header className="header">
                <span className="eyebrow">MICROSERVICE CLIENT</span>
                <h1>Board Game Lending System</h1>
                <p>Micro Frontends with Webpack Module Federation</p>
            </header>

            <nav className="navigation" aria-label="Main navigation">
                <button className={page === "catalog" ? "active" : ""} onClick={() => setPage("catalog")}>
                    Game Catalog
                </button>
                <button className={page === "borrowing" ? "active" : ""} onClick={() => setPage("borrowing")}>
                    Borrowing
                </button>
                <button className={page === "users" ? "active" : ""} onClick={() => setPage("users")}>
                    Users
                </button>
            </nav>

            <main className="content">
                <Suspense fallback={<div className="loading">Loading Micro Frontend…</div>}>
                    {page === "catalog" && <CatalogApp />}
                    {page === "borrowing" && <BorrowingApp />}
                    {page === "users" && <UsersApp />}
                </Suspense>
            </main>
        </div>
    );
}
