const axios = require('axios');

const TMDB_API_TOKEN = process.env.TMDB_API_ACCESS_TOKEN;

const tmdbAPI = axios.create({ 
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: 'Bearer ' + TMDB_API_TOKEN,
    Accept: 'application/json'
  },
  params: {
    include_adult: false,
    language: 'en-US'
  }
});

module.exports = tmdbAPI;