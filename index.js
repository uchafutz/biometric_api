const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const client = require('twilio')(process.env.ACCOUNTS_ID, process.env.AUTHTOKEN);
const app = express();
app.use(express.json());
app.listen(process.env.SERVE_PORT, async (req, res) => {
    try {
        const data = await fetch(process.env.BIO_URL);
        client.messages.create({
            body: data,
            messagingServiceSid: process.env.MESSAGE_ID,
            to: process.env.BIO_TO
        }).then(messages => console.log(messages.sid)).done();

        res.status(201).json(data);
    } catch (error) {
        console.log("Failed to get data", `${error}`);
    }
    console.log("Serve is running...!port:", process.env.SERVE_PORT);
})