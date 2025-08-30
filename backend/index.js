import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

const app = express();

const PORT = +process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

import movieRoutes from './routes/movies.js';
import authRoutes from './routes/auth.js';
import errorHandler from './controllers/error.js';

app.use('/movies', movieRoutes);
app.use('/auth', authRoutes);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_CONNECTION_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
  })
  .catch(err => console.log(err));

// app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
