const express = require('express');
const router = express.Router();

const moviesControllers = require('../controllers/movies');

router.get('/search', moviesControllers.getSearchedMovies);

router.get('/:movieId', moviesControllers.getMovieData);


module.exports = router;