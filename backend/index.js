import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

const app = express();

const PORT = +process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(cookieParser());

import movieRoutes from './routes/movies.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import interactionsRoutes from './routes/interactions.js';
import errorHandler from './controllers/error.js';

app.use('/movies', movieRoutes);
app.use('/auth', authRoutes);
app.use('/interactions', interactionsRoutes);
app.use('/user', userRoutes);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
