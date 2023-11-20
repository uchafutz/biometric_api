const express = require("express");
const dotenv = require("dotenv");
const axios = require('axios');
const accountSid = 'ACa192a9e2ab2a5fcf5fd231fbe8a7c70e';
const authToken = '334c26b3264b5c741ef9bf5e3f20bad6';
dotenv.config();
const client = require('twilio')(accountSid, authToken);
const app = express();
const http = require('http');
app.use(express.json());
const currentTime = new Date();


const year = currentTime.getFullYear();
const month = currentTime.getMonth() + 1; // Months are zero-based, so add 1
const day = currentTime.getDate();
const hours = currentTime.getHours();
const minutes = currentTime.getMinutes();
const seconds = currentTime.getSeconds();



const fetchData = async () => {
    try {
        const url = new URL(process.env.BIO_URL);
        const options = {
            hostname: url.hostname,
            port: url.port || 8000,
            path: url.pathname,
            method: 'GET',
        };

        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';

                // A chunk of data has been received.
                res.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received.
                res.on('end', () => {
                    console.log('Data successfully obtained', `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
                    resolve(data);
                });
            });

            // Handle errors during the HTTP request.
            req.on('error', (error) => {
                console.error('Failed to fetch data:', error.message);
                reject(error);
            });

            // End the request (this is important for GET requests).
            req.end();
        });
    } catch (error) {
        console.error('Failed to fetch data:', `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`, error.message);
        throw error;
    }
};

// Example usage:
fetchData()
    .then((data) => {
        // Process the data here
        console.log(data);
    })
    .catch((error) => {
        // Handle errors here
        console.error(error);
    });

const filterData = (data) => {
    if (Array.isArray(data)) {
        return data.filter(item => { /* your filter condition */ });
    } else {
        console.error('Input is not an array.');
        // Handle the error or return an appropriate value
        return [];
    }
};

const sendMessage = async (filteredData) => {
    try {
        const message = await client.messages.create({
            body: JSON.stringify(filteredData), // Adjust the message body as needed
            messagingServiceSid: process.env.MESSAGE_ID,
            to: process.env.BIO_TO
        });

        console.log(`Message SID: ${message.sid}`);
        return true; // Indicate success
    } catch (error) {
        console.error('Failed to send SMS:', error.message);
        return false; // Indicate failure
    }
};

const processDataAndSendMessage = async () => {
    try {
        const data = await fetchData();

        if (data && data.length > 0) {
            //const filteredData = filterData(data);
            const success = await sendMessage(data);

            if (!success) {
                setTimeout(processDataAndSendMessage, 1 * 60 * 1000);
            }
        } else {

            console.log('No data to process.');
        }
    } catch (error) {
        console.error('Error in processDataAndSendMessage:', error.message);

        setTimeout(processDataAndSendMessage, 1 * 60 * 1000);
    }
};
//test bio
app.listen(process.env.SERVE_PORT, async (req, res) => {
    processDataAndSendMessage();
    console.log("Server is running... Port:", process.env.SERVE_PORT);
});
