"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchData = void 0;
// Importing 'axios' for making HTTP requests.
const axios_1 = require("axios");
// Defining an async function 'fetchData' to fetch data from the server.
async function fetchData() {
    try {
        // Making a GET request to the specified URL and awaiting the response.
        const response = await axios_1.default.get('http://localhost:8080/get_data');
        // Returning the 'message' from the response data.
        return response.data.message;
    }
    catch (error) {
        // Logging an error message to the console if the request fails.
        console.error('Error fetching data from Server.py:', error);
        // Returning 'null' in case of an error.
        return null;
    }
}
exports.fetchData = fetchData;
//# sourceMappingURL=listener.js.map