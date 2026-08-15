const {
    database
} = require("./database");


function addEvent(
    eventType,
    payload,
    callback
) {

    const createdAt =
        new Date().toISOString();


    database.run(
        `
        INSERT INTO outbox
        (
            event_type,
            payload,
            created_at
        )
        VALUES (?, ?, ?)
        `,
        [
            eventType,
            JSON.stringify(payload),
            createdAt
        ],
        function(error) {

            if (error) {

                callback(error);
                return;
            }

            callback(null, this.lastID);
        }
    );
}


function getPendingEvents(callback) {

    database.all(
        `
        SELECT
            id,
            event_type,
            payload,
            created_at,
            published
        FROM outbox
        WHERE published = 0
        ORDER BY id ASC
        `,
        [],
        callback
    );
}


function markPublished(
    id,
    callback
) {
    database.run(
        `
        UPDATE outbox
        SET published = 1
        WHERE id = ?
        `,
        [id],
        callback
    );
}


module.exports = {

    addEvent,

    getPendingEvents,

    markPublished
};