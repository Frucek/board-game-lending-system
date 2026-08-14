const axios = require("axios");

const USER_SERVICE_URL =
    process.env.USER_SERVICE_URL ||
    "http://localhost:3000";

async function getUsers() {

    console.log("BFF -> User Management: GET /users");

    const response = await axios.get(
        `${USER_SERVICE_URL}/users`
    );

    return response.data;
}

async function getUser(id) {

    console.log(
        `BFF -> User Management: GET /users/${id}`
    );

    const response = await axios.get(
        `${USER_SERVICE_URL}/users/${id}`
    );

    return response.data;
}

async function createUser(user) {

    console.log(
        "BFF -> User Management: POST /users"
    );

    const response = await axios.post(
        `${USER_SERVICE_URL}/users`,
        user
    );

    return response.data;
}

module.exports = {
    getUsers,
    getUser,
    createUser
};