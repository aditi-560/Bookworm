import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import connectDB from './lib/db.js';
import router from './routes/authRoutes.js';
import booksRouter from './routes/bookRoutes.js';
import job from "./lib/cron.js"
const app = express();

connectDB();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', router);
app.use('/api/auth', booksRouter);

job.start();


app.listen(3000, () => {
    console.log("server on 3000");
})