import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import remoteApiController from './controllers/remoteApi-controller.js';

const app = express();
app.use(express.json());

app.use(
    cors({
        credentials: true,
        origin: process.env.CORS || "http://localhost:3000",
    })
);

dotenv.config();

remoteApiController(app);
app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port 4000`)});