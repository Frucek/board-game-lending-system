const stompit = require("stompit");

let connected = false;
let client = null;

function connectBroker() {
    const host = process.env.ACTIVEMQ_HOST || "localhost";
    const port = Number(process.env.ACTIVEMQ_PORT || 61613);

    stompit.connect(
        {
            host: host,
            port: port
        },
        (error, connection) => {

            if (error) {
                console.error(
                    "ActiveMQ connection error:",
                    error.message
                );

                connected = false;
                return;
            }

            client = connection;
            connected = true;

            console.log(
                "Connected to ActiveMQ"
            );

            connection.on("error", (error) => {

                console.error(
                    "ActiveMQ error:",
                    error.message
                );

                connected = false;
            });

            connection.on("close", () => {

                console.log(
                    "ActiveMQ connection closed"
                );

                connected = false;
            });
        }
    );
}


function publishEvent(eventType, data) {

    if (!connected || !client) {

        console.warn(
            `ActiveMQ is not connected. Event not published: ${eventType}`
        );

        return;
    }

    const message = JSON.stringify({
        type: eventType,
        timestamp: new Date().toISOString(),
        data: data
    });

    const frame = client.send({
        destination: "/topic/user-events",
        "content-type": "application/json"
    });

    frame.write(message);

    frame.end();

    console.log(
        `Published event: ${eventType}`
    );
}


module.exports = {
    connectBroker,
    publishEvent
};