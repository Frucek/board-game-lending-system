import React from "react";
import { createRoot } from "react-dom/client";
import CatalogApp from "./CatalogApp";

const root =
    document.getElementById("root");

if (!root) {
    throw new Error("Root not found");
}

createRoot(root).render(
    <React.StrictMode>
        <CatalogApp />
    </React.StrictMode>
);