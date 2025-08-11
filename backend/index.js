const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

require('./util/configEnv')();
const PORT = +process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const movieRoutes = require('./routes/movies');
const errorHandler = require('./controllers/error');

app.use('/movies', movieRoutes);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_CONNECTION_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
  })
  .catch(err => console.log(err));