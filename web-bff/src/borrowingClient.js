const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(
    __dirname,
    "../proto/borrowing.proto"
);

const packageDefinition =
    protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

const proto =
    grpc.loadPackageDefinition(packageDefinition);

const borrowing =
    proto.borrowing;

const BORROWING_URL =
    process.env.BORROWING_URL ||
    "localhost:50051";

const client =
    new borrowing.BorrowingService(
        BORROWING_URL,
        grpc.credentials.createInsecure()
    );

function borrowGame(userId, gameId) {

    return new Promise((resolve, reject) => {

        console.log(
            `BFF -> Borrowing: borrow user=${userId}, game=${gameId}`
        );

        client.BorrowGame(
            {
                user_id: Number(userId),
                game_id: Number(gameId)
            },
            (error, response) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(response);
            }
        );
    });
}

function returnGame(borrowingId) {

    return new Promise((resolve, reject) => {

        console.log(
            `BFF -> Borrowing: return id=${borrowingId}`
        );

        client.ReturnGame(
            {
                borrowing_id: Number(borrowingId)
            },
            (error, response) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(response);
            }
        );
    });
}

function getBorrowingHistory(userId) {

    return new Promise((resolve, reject) => {

        client.GetBorrowingHistory(
            {
                user_id: Number(userId)
            },
            (error, response) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(response);
            }
        );
    });
}

module.exports = {
    borrowGame,
    returnGame,
    getBorrowingHistory
};