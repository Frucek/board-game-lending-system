import React from "react";
import { createRoot } from "react-dom/client";
import BorrowingApp from "./BorrowingApp";

const root =
    document.getElementById("root");

if (!root) {
    throw new Error("Root not found");
}

createRoot(root).render(
    <React.StrictMode>
        <BorrowingApp />
    </React.StrictMode>
);