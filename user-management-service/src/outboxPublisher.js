const {
    getPendingEvents,
    markPublished
} = require("./outbox");

const {
    publishEvent
} = require("./messageBroker");


const POLLING_INTERVAL =
    Number(
        process.env.OUTBOX_POLLING_INTERVAL ||
        1000
    );


function getPendingEventsPromise() {

    return new Promise((resolve, reject) => {

        getPendingEvents(
            (error, events) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(events);
            }
        );
    });
}


function markPublishedPromise(id) {

    return new Promise((resolve, reject) => {

        markPublished(
            id,
            error => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            }
        );
    });
}


async function processOutbox() {

    let events;

    try {

        events =
            await getPendingEventsPromise();

    } catch (error) {

        console.error(
            "Failed to read outbox:",
            error
        );

        return;
    }


    for (const event of events) {

        try {

            await publishEvent(event);

            await markPublishedPromise(
                event.id
            );

        } catch (error) {

            console.error(
                `Failed to process outbox event ${event.id}:`,
                error.message
            );

            /*
             * Stop here so the failed event
             * remains pending and ordering is preserved.
             */
            break;
        }
    }
}


function startOutboxPublisher() {

    console.log(
        `Transactional Outbox publisher started. Polling every ${POLLING_INTERVAL} ms`
    );

    return setInterval(
        processOutbox,
        POLLING_INTERVAL
    );
}


module.exports = {
    startOutboxPublisher,
    processOutbox
};