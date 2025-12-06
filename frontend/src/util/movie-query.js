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


export async function addInteraction({ type, movieId }) {
  const body = { movieId, interactionType: type };
  const response = await api.post(`/interactions`, body);
  return response.data;
}


export async function getRatings({ queryKey }) {
  let url = '/ratings';
  const params = (queryKey.length > 1) ? queryKey[1] : null;
  const requestParams = [];
  if (params?.page) requestParams.push(`page=${params.page}`);
  if (params?.movieId) requestParams.push(`movieId=${params.movieId}`);
  if (requestParams.length) url += '?' + requestParams.join('&');
  const response = await api.get(url);
  return response.data;
}


export async function addRating({ rating, movieId }) {
  const body = { ...rating, movieId };
  const response = await api.post('/ratings', body);
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
  let url = '/interactions';
  const params = queryKey[1];
  const queryParams = [];
  const { interactionType, page } = params;
  if (interactionType) queryParams.push(`interactionType=${interactionType}`);
  if (page) queryParams.push(`page=${page}`);
  if (queryParams.length) url += '?' + queryParams.join('&');
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
  const { genre, orderBy='random', page = 1 } = queryKey[1];

  // cannot fetch movies by genre if genres weren't loaded
  if (!genre) return [];

  let url;
  if (genre) url = `/movies/genre/${genre}?page=${page}`;
  if (orderBy) url += '&orderBy=' + orderBy;
  const response = await api.get(url);
  return response.data;
}


export const loadGenres = async () => {
  const response = await api.get('/movies/genres');
  const { genres } = response.data;
  const filtered = genres.filter(({ genre_name }) => genre_name !== 'Documentary');
  return filtered;
}