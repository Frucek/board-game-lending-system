const request = require("supertest");

const app = require("../src/app");

describe("Web BFF", () => {

    test("health endpoint works", async () => {

        const response =
            await request(app)
                .get("/health");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.status)
            .toBe("UP");
    });

});