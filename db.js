require('dotenv').config();
const mongoose = require("mongoose");

const MONGODB = process.env.MONGODB;

function connectionMongoDB() {
    if (!MONGODB) {
        throw new Error('Mongodb environment variable is not set');
    }
    mongoose.connect(MONGODB)

    mongoose.connection.on("connected", () => {
        console.log("Connection to MongoDB successful");
    });

    mongoose.connection.on("error", (err) => {
        console.log(err);
    });
}

module.exports = { connectionMongoDB };