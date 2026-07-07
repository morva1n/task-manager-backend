import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import tasksRouter from './routes/tasks.routes.js';

const app = express();

dotenv.config();

app.use(cors({
    origin: process.env.CLIENT_URL
}));
app.use(express.json());

app.use('/tasks', tasksRouter)

app.listen(process.env.PORT, () =>{
    console.log(`Server is running at ${process.env.PORT} port`)
})