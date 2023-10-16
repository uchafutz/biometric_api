const express = require("express");
const dotenv = require("dotenv");
const axios = require('axios');
const accountSid = 'ACa192a9e2ab2a5fcf5fd231fbe8a7c70e';
const authToken = '334c26b3264b5c741ef9bf5e3f20bad6';
dotenv.config();
const client = require('twilio')(accountSid, authToken);
const app = express();
app.use(express.json());
//test bio
app.listen(process.env.SERVE_PORT, async (req, res) => {
    try {
        const response = await axios.get(process.env.BIO_URL);
        const data = response.data;

        const message = await client.messages.create({
            body: data,
            messagingServiceSid: process.env.MESSAGE_ID,
            to: process.env.BIO_TO
        });

        console.log(`Message SID: ${message.sid}`);
        res.status(201).json({ message: `Message SID: ${message.sid}` });
    } catch (error) {
        console.error("Failed to get data:", error);
        res.status(404).json({ error: "Failed to send SMS" });
    }

    console.log("Server is running... Port:", process.env.SERVE_PORT);
});
