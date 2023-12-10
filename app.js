import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import remoteApiController from './controllers/remoteApi-controller.js';
import UserController from "./controllers/user-controller.js";
import watchlistController from './controllers/watchlist-controller.js';
import FolloweesController from "./controllers/followees-controller.js";
import CommentController from './controllers/comment-controller.js';


const app = express();
app.use(express.json());

app.use(
    cors({
        credentials: true,
        origin: process.env.CORS || "http://localhost:3000",
    })
);

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
        // cookie: { secure: false },
    })
);

dotenv.config();
const CONNECTION_STRING = process.env.DB_CONNECTION || 'mongodb://localhost:27017/cs5610_all_in';
mongoose.connect(CONNECTION_STRING);

remoteApiController(app);
UserController(app);
watchlistController(app);
FolloweesController(app);
CommentController(app);

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port 4000`)});