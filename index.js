const express = require("express");
const dotenv = require("dotenv");
const axios = require('axios');
const accountSid = 'ACa192a9e2ab2a5fcf5fd231fbe8a7c70e';
const authToken = '334c26b3264b5c741ef9bf5e3f20bad6';
dotenv.config();
const client = require('twilio')(accountSid, authToken);
const app = express();
app.use(express.json());


const fetchData = async () => {
    try {
        const response = await axios.get(process.env.BIO_URL);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch data:', error.message);
        throw error;
    }
}

const filterData = (data) => {
    return data.filter(item => { item.name });
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
            const filteredData = filterData(data);
            const success = await sendMessage(filteredData);

            if (!success) {
                // Retry after a set time interval (e.g., 5 minutes)
                setTimeout(processDataAndSendMessage, 2 * 60 * 1000);
            }
        } else {

            console.log('No data to process.');
        }
    } catch (error) {
        console.error('Error in processDataAndSendMessage:', error.message);
        // Retry after a set time interval (e.g., 5 minutes)
        setTimeout(processDataAndSendMessage, 2 * 60 * 1000);
    }
};
//test bio
app.listen(process.env.SERVE_PORT, async (req, res) => {
    processDataAndSendMessage();
    console.log("Server is running... Port:", process.env.SERVE_PORT);
});
