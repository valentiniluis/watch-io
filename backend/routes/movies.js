const express = require('express');
const router = express.Router();

const moviesControllers = require('../controllers/movies');

router.get('/search', moviesControllers.getSearchedMovies);

router.get('/:movieId', moviesControllers.getMovieData);

router.get('/:movieId/recommendations', moviesControllers.getRecommendations);


module.exports = router;