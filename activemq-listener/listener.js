const stompit = require("stompit");

const connectOptions = {
    host: "localhost",
    port: 61613
};

stompit.connect(connectOptions, (error, client) => {
    if (error) {
        console.error("❌ Could not connect to ActiveMQ:");
        console.error(error.message);
        return;
    }

    console.log("✅ Connected to ActiveMQ");

    const subscribeHeaders = {
        destination: "/topic/user-events",
        ack: "auto"
    };

    client.subscribe(subscribeHeaders, (error, message) => {
        if (error) {
            console.error("❌ Subscribe error:");
            console.error(error.message);
            return;
        }

        message.on("data", (chunk) => {
            process.stdout.write(chunk);
        });

        message.on("end", () => {
            console.log("\n📨 Message received from ActiveMQ!");
            console.log("--------------------------------");
        });
    });

    console.log("👂 Listening on /topic/user-events...");
});