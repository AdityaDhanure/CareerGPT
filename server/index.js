import cors from 'cors'; // to connect both frontend & backend
import express from 'express';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

import bodyParser from 'body-parser'; // to parse incoming request bodies

import authRoutes from './routes/authRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';

import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN, // or your frontend domain
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // handle preflight

// app.use(bodyParser.json());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);

app.use(errorHandler); 

mongoose.connect(process.env.MONGO_URL).then(() => {
  app.listen(process.env.PORT, '0.0.0.0', (err) => {
    if (err) console.log(err);
    console.log(`Server started.... on port ${process.env.PORT}`);});
});
