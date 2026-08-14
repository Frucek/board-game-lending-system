const { Observable } = require("rxjs");
const { database } = require("./database");
const User = require("./user");

function getUsers() {
    return new Observable((subscriber) => {

        console.log("Getting all users");

        database.all(
            "SELECT * FROM users",
            [],
            (error, rows) => {

                if (error) {
                    console.error("Error getting users:", error);
                    subscriber.error(error);
                    return;
                }

                const users = rows.map(
                    row => new User(
                        row.id,
                        row.name,
                        row.email,
                        row.status,
                        row.borrowing_limit
                    )
                );

                subscriber.next(users);
                subscriber.complete();
            }
        );
    });
}


function getUser(id) {
    return new Observable((subscriber) => {

        console.log(`Getting user ${id}`);

        database.get(
            "SELECT * FROM users WHERE id = ?",
            [id],
            (error, row) => {

                if (error) {
                    console.error("Error getting user:", error);
                    subscriber.error(error);
                    return;
                }

                if (!row) {
                    subscriber.next(null);
                    subscriber.complete();
                    return;
                }

                subscriber.next(
                    new User(
                        row.id,
                        row.name,
                        row.email,
                        row.status,
                        row.borrowing_limit
                    )
                );

                subscriber.complete();
            }
        );
    });
}


function createUser(name, email) {
    return new Observable((subscriber) => {

        console.log(`Creating user: ${email}`);

        database.run(
            `
            INSERT INTO users
            (name, email, status, borrowing_limit)
            VALUES (?, ?, ?, ?)
            `,
            [
                name,
                email,
                "ACTIVE",
                3
            ],
            function(error) {

                if (error) {
                    console.error("Error creating user:", error);
                    subscriber.error(error);
                    return;
                }

                getUser(this.lastID).subscribe({
                    next: user => subscriber.next(user),
                    error: error => subscriber.error(error),
                    complete: () => subscriber.complete()
                });
            }
        );
    });
}


function updateUserStatus(id, status) {
    return new Observable((subscriber) => {

        console.log(
            `Updating user ${id} status to ${status}`
        );

        database.run(
            `
            UPDATE users
            SET status = ?
            WHERE id = ?
            `,
            [status, id],
            function(error) {

                if (error) {
                    console.error(
                        "Error updating status:",
                        error
                    );

                    subscriber.error(error);
                    return;
                }

                if (this.changes === 0) {
                    subscriber.next(null);
                    subscriber.complete();
                    return;
                }

                getUser(id).subscribe({
                    next: user => subscriber.next(user),
                    error: error => subscriber.error(error),
                    complete: () => subscriber.complete()
                });
            }
        );
    });
}


function deleteUser(id) {
    return new Observable((subscriber) => {

        console.log(`Deleting user ${id}`);

        database.run(
            "DELETE FROM users WHERE id = ?",
            [id],
            function(error) {

                if (error) {
                    console.error(
                        "Error deleting user:",
                        error
                    );

                    subscriber.error(error);
                    return;
                }

                subscriber.next(
                    this.changes > 0
                );

                subscriber.complete();
            }
        );
    });
}


module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUserStatus,
    deleteUser
};