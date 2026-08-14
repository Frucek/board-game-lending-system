const sqlite3 = require("sqlite3").verbose();

const database = new sqlite3.Database("users.db");

function initializeDatabase() {
    database.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL,
            borrowing_limit INTEGER NOT NULL
        )
    `);
}

module.exports = {
    database,
    initializeDatabase
};