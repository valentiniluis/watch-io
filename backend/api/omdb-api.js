import axios from 'axios';


const OMDB_API_TOKEN = process.env.OMDB_API_ACCESS_TOKEN;

export default axios.create({
  baseURL: 'http://www.omdbapi.com',
  params: {
    apikey: OMDB_API_TOKEN
  }
});