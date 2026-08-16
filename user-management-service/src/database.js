const sqlite3 =
    require("sqlite3").verbose();


const DATABASE_PATH =
    process.env.DATABASE_PATH ||
    "/data/users.db";


const database =
    new sqlite3.Database(
        DATABASE_PATH
    );


function initializeDatabase() {

    return new Promise(
        (resolve, reject) => {

            database.serialize(() => {

                database.run(
                    `
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        status TEXT NOT NULL,
                        borrowing_limit INTEGER NOT NULL
                    )
                    `,
                    error => {

                        if (error) {
                            reject(error);
                            return;
                        }

                        database.run(
                            `
                            CREATE TABLE IF NOT EXISTS outbox (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                event_type TEXT NOT NULL,
                                payload TEXT NOT NULL,
                                created_at TEXT NOT NULL,
                                published INTEGER NOT NULL DEFAULT 0
                            )
                            `,
                            error => {

                                if (error) {
                                    reject(error);
                                    return;
                                }

                                resolve();
                            }
                        );
                    }
                );
            });
        }
    );
}


module.exports = {
    database,
    initializeDatabase
};