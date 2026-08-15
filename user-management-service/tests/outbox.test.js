const database = require("../src/database");

const {
    addEvent,
    getPendingEvents,
    markPublished
} = require("../src/outbox");


beforeAll(() => {

    return new Promise((resolve) => {

        database.initializeDatabase();

        setTimeout(resolve, 100);
    });
});


beforeEach(() => {

    return new Promise((resolve, reject) => {

        database.database.run(
            "DELETE FROM outbox",
            error => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            }
        );
    });
});


afterAll(() => {

    return new Promise((resolve) => {

        database.database.close(() => {
            resolve();
        });
    });
});


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


function addEventPromise(
    eventType,
    payload
) {

    return new Promise((resolve, reject) => {

        addEvent(
            eventType,
            payload,
            (error, id) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(id);
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


describe("Transactional Outbox", () => {


    test("adds an event to the outbox", async () => {

        const eventId =
            await addEventPromise(
                "UserCreated",
                {
                    id: 1,
                    name: "John",
                    email: "john@test.com"
                }
            );


        expect(eventId)
            .toBeDefined();


        const events =
            await getPendingEventsPromise();


        expect(events.length)
            .toBe(1);


        expect(events[0].id)
            .toBe(eventId);

        expect(events[0].event_type)
            .toBe("UserCreated");

        expect(events[0].published)
            .toBe(0);


        const payload =
            JSON.parse(events[0].payload);


        expect(payload.id)
            .toBe(1);

        expect(payload.name)
            .toBe("John");
    });


    test("returns only unpublished events", async () => {

        const firstId =
            await addEventPromise(
                "UserCreated",
                {
                    id: 1
                }
            );


        await addEventPromise(
            "UserCreated",
            {
                id: 2
            }
        );


        await markPublishedPromise(
            firstId
        );


        const events =
            await getPendingEventsPromise();


        expect(events.length)
            .toBe(1);

        expect(events[0].id)
            .not
            .toBe(firstId);
    });


    test("marks an event as published", async () => {

        const eventId =
            await addEventPromise(
                "UserCreated",
                {
                    id: 1
                }
            );


        await markPublishedPromise(
            eventId
        );


        const events =
            await new Promise(
                (resolve, reject) => {

                    database.database.all(
                        `
                        SELECT *
                        FROM outbox
                        WHERE id = ?
                        `,
                        [eventId],
                        (error, rows) => {

                            if (error) {
                                reject(error);
                                return;
                            }

                            resolve(rows);
                        }
                    );
                }
            );


        expect(events.length)
            .toBe(1);

        expect(events[0].published)
            .toBe(1);
    });


    test("events are returned in ID order", async () => {

        await addEventPromise(
            "UserCreated",
            {
                id: 1
            }
        );


        await addEventPromise(
            "UserStatusChanged",
            {
                id: 1
            }
        );


        await addEventPromise(
            "UserDeleted",
            {
                id: 1
            }
        );


        const events =
            await getPendingEventsPromise();


        expect(events.length)
            .toBe(3);


        expect(events[0].event_type)
            .toBe("UserCreated");

        expect(events[1].event_type)
            .toBe("UserStatusChanged");

        expect(events[2].event_type)
            .toBe("UserDeleted");
    });

});