//allow us to use process.ENV
import dotenv from "dotenv";
dotenv.config();

//import libraries needed for the webserver to work!
import http from "http";
import express from "express"; // backend framework for our node server.
import session from "express-session"; // library that stores info about each connected user
import mongoose from "mongoose"; // library to connect to MongoDB

import api from "./Endpoints/api.js";

// Server configuration below
// TODO change connection URL after setting up your team database
const mongoConnectionURL = process.env.MONGO_DB_SRV;
// TODO change database name to the name you chose
const databaseName = "Records";

mongoose.set("strictQuery", false);

// Add this CORS middleware before your routes
// connect to mongodb
mongoose
    .connect(mongoConnectionURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: databaseName,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));

// create a new express server
const app = express();
app.use(express.json());

// set up a session, which will persist login data across requests
app.use(
    session({
        // TODO: add a SESSION_SECRET string in your .env file, and replace the secret with process.env.SESSION_SECRET
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
// set up possible API calls
app.use("/api", api);

const port = 3000;
const server = http.Server(app);

server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
