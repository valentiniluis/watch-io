import api from "../api/request";

export async function fetchMovies({ queryKey }) {
  const parameters = queryKey[1];
  const { searchTerm, page = 1 } = parameters;
  let url = `/movies/search?page=${page}`;
  url += (searchTerm.length > 0) ? `&movie=${searchTerm}` : '';
  const response = await api.get(url);
  const data = response.data;
  return data;
}


export async function addInteraction({ movie, type }) {
  const response = await api.post(`/interactions/${type}`, movie);
  return response.data;
}


export async function getRatings({ queryKey }) {
  let url = '/ratings';
  if (queryKey.length > 1) {
    const parameters = queryKey[1];
    const { movieId } = parameters;
    url += `?movieId=${movieId}`;
  }
  const response = await api.get(url);
  return response.data;
}


export async function addRating({ movie, rating }) {
  const response = await api.post('/ratings', { movie, rating });
  return response.data;
}


export async function editRating({ movie, rating }) {
  const response = await api.put(`/ratings/${movie.id}`, rating);
  return response.data;
}


export async function deleteRating({ movie }) {
  const response = await api.delete(`/ratings/${movie.id}`);
  return response.data;
}


export async function getInteractedMovies({ queryKey }) {
  const params = queryKey[1];
  const { interactionType } = params;
  let url = '/interactions';
  if (interactionType) url += `?interactionType=${interactionType}`;
  const response = await api.get(url);
  return response.data;
}


export async function removeInteraction({ movieId, type }) {
  const response = await api.delete(`/interactions/${type}/${movieId}`);
  return response.data;
}


export async function getInteractions({ queryKey }) {
  const { movieId } = queryKey[1];
  if (!movieId) throw new Error('Movie must be provided.');
  const response = await api.get('/interactions/' + movieId);
  return response.data;
}


export const loadMovieData = async ({ queryKey }) => {
  const { movieId } = queryKey[1];
  const response = await api.get('/movies/' + movieId);
  const data = response.data;
  if (!data.success) throw new Error(data.status_message);
  return data;
}


export const loadRecommendations = async ({ queryKey }) => {
  const { movieId } = queryKey[1];
  const response = await api.get('/movies/' + movieId + '/recommendations');
  const data = response.data;
  if (!data.success) throw new Error(data.status_message);
  return data;
}


export const loadMoviesByGenre = async ({ queryKey }) => {
  const { genre, orderBy } = queryKey[1];

  // cannot fetch movies by genre if genres weren't loaded
  if (!genre) return [];

  let url;
  if (genre) url = '/movies/genre/' + genre;
  if (orderBy) url += '?orderBy=' + orderBy;
  const response = await api.get(url);
  return response.data.movies;
}


export const loadGenres = async () => {
  const response = await api.get('/movies/genres');
  return response.data.genres;
}