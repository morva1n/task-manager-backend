import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';

import tasksRouter from './routes/tasks.routes.js';
import userRouter from './routes/user.routes.js'
import {errorMiddleware} from './middlewares/error.middlewares.js';

const app = express();

dotenv.config();

app.use(cors({
    origin: process.env.CLIENT_URL
}));
app.use(express.json());
app.use(cookieParser())

app.use('/tasks', tasksRouter)
app.use('/user', userRouter)
app.use(errorMiddleware)

app.listen(process.env.PORT, () =>{
    console.log(`Server is running at ${process.env.PORT} port`)
})