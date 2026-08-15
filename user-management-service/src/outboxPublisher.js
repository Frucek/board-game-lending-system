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


async function processOutbox() {

    getPendingEvents(
        async (error, events) => {

            if (error) {

                console.error(
                    "Failed to read outbox:",
                    error
                );

                return;
            }


            for (
                const event
                of events
            ) {

                try {

                    await publishEvent(
                        event
                    );


                    markPublished(
                        event.id,
                        (markError) => {

                            if (markError) {

                                console.error(
                                    `Failed to mark event ${event.id} as published:`,
                                    markError
                                );
                            }
                        }
                    );

                } catch (publishError) {

                    console.error(
                        `Failed to publish outbox event ${event.id}:`,
                        publishError.message
                    );

                    /*
                     * Keep published = 0.
                     *
                     * The event will be retried
                     * during the next polling cycle.
                     */

                    break;
                }
            }
        }
    );
}


function startOutboxPublisher() {

    console.log(
        `Transactional Outbox publisher started. Polling every ${POLLING_INTERVAL} ms`
    );


    setInterval(
        processOutbox,
        POLLING_INTERVAL
    );
}


module.exports = {

    startOutboxPublisher,

    processOutbox
};