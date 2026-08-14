const axios = require("axios");

const USER_SERVICE_URL =
    process.env.USER_SERVICE_URL ||
    "http://localhost:3000";


async function getUsers() {

    console.log(
        "BFF -> User Management: GET /users"
    );

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


async function updateUserStatus(id, status) {

    console.log(
        `BFF -> User Management: PUT /users/${id}/status`
    );

    const response = await axios.put(
        `${USER_SERVICE_URL}/users/${id}/status`,
        {
            status
        }
    );

    return response.data;
}


async function deleteUser(id) {

    console.log(
        `BFF -> User Management: DELETE /users/${id}`
    );

    const response = await axios.delete(
        `${USER_SERVICE_URL}/users/${id}`
    );

    return response.data;
}


module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUserStatus,
    deleteUser
};