const stompit =
    require("stompit");


let connected = false;

let client = null;


function connectBroker() {
    const host =
        process.env.ACTIVEMQ_HOST ||
        "localhost";

    const port =
        Number(
            process.env.ACTIVEMQ_PORT ||
            61613
        );

    console.log(
        `Connecting to ActiveMQ at ${host}:${port}...`
    );

    stompit.connect(
        {
            host,
            port
        },
        (error, connection) => {
            if (error) {
                console.error(
                    "ActiveMQ connection error:",
                    error.message
                );

                connected = false;
                client = null;

                setTimeout(connectBroker, 5000);

                return;
            }

            client = connection;
            connected = true;

            console.log(
                "Connected to ActiveMQ"
            );

            connection.on(
                "error",
                (error) => {
                    console.error(
                        "ActiveMQ error:",
                        error.message
                    );

                    connected = false;
                }
            );

            connection.on(
                "close",
                () => {
                    console.log(
                        "ActiveMQ connection closed"
                    );

                    connected = false;
                    client = null;

                    setTimeout(connectBroker, 5000);
                }
            );
        }
    );
}


/*
 * ==========================================
 * PUBLISH EVENT
 * ==========================================
 */

function publishEvent(
    event
) {

    return new Promise(
        (resolve, reject) => {

            if (
                !connected ||
                !client
            ) {

                reject(
                    new Error(
                        "ActiveMQ is not connected"
                    )
                );

                return;
            }


            const message =
                JSON.stringify({

                    id: event.id,

                    type:
                        event.event_type,

                    timestamp:
                        event.created_at,

                    data:
                        JSON.parse(event.payload)
                });


            try {

                const frame =
                    client.send({

                        destination:
                            "/topic/user-events",

                        "content-type":
                            "application/json"
                    });


                frame.write(message);

                frame.end();


                console.log(
                    `Published outbox event ${event.id}: ${event.event_type}`
                );


                resolve();

            } catch (error) {

                reject(error);
            }
        }
    );
}


module.exports = {

    connectBroker,

    publishEvent
};