const axios = require('axios');

const OMDB_API_TOKEN = process.env.OMDB_API_ACCESS_TOKEN;

const omdbAPI = axios.create({
  baseURL: 'http://www.omdbapi.com',
  params: {
    apikey: OMDB_API_TOKEN
  }
});

module.exports = omdbAPI;