import api from "../api/request";

export async function fetchMedia({ queryKey }) {
  const [mediaType, params] = queryKey;
  const { searchTerm, page = 1 } = params;
  let url = `/${mediaType}/search?page=${page}`;
  url += (searchTerm.length > 0) ? `&title=${searchTerm}` : '';
  const response = await api.get(url);
  const data = response.data;
  return data;
}


export async function addInteraction({ type, mediaId, mediaType }) {
  const body = { mediaId, interactionType: type, mediaType };
  const response = await api.post('/interaction', body);
  return response.data;
}


export const getMyAreaContent = async ({ queryKey }) => {
  const [mainKey, params] = queryKey;
  const { mediaType } = params;
  let url = `/${mainKey}/${mediaType}`;

  // filter entries that have non-null/non-undefined values
  const queryParams = Object.entries(params).filter(([key, value]) => key !== 'mediaType' && value);

  if (queryParams.length > 0) {
    const queryString = queryParams.map(([key, value]) => `${key}=${value}`).join('&');
    url += '?' + queryString;
  }
  const response = await api.get(url);
  return response.data;
}


export async function getRating({ queryKey }) {
  const params = queryKey[1];
  const { mediaId, mediaType } = params;

  let url = `/rating/check/${mediaType}/${mediaId}`;
  const response = await api.get(url);
  return response.data;
}


export async function getInteractedMovies({ queryKey }) {
  const params = queryKey[1];
  const { interactionType, page, mediaType } = params;
  let url = `/interaction/${mediaType}`;
  const queryParams = [];
  if (interactionType) queryParams.push(`interactionType=${interactionType}`);
  if (page) queryParams.push(`page=${page}`);
  if (queryParams.length) url += '?' + queryParams.join('&');
  const response = await api.get(url);
  return response.data;
}


export async function mutateRating({ rating, mediaId, mediaType, method }) {
  if (!['POST', 'PUT'].includes(method)) throw new Error("Invalid method!");

  const body = { ...rating, mediaId, mediaType };
  let response;
  const url = "/rating";
  if (method === 'POST') response = await api.post(url, body);
  else if (method === 'PUT') response = await api.put(url, body);
  return response.data;
}


export async function deleteRating({ mediaId, mediaType }) {
  const response = await api.delete(`/rating/${mediaType}/${mediaId}`);
  return response.data;
}


export async function removeInteraction({ mediaId, mediaType }) {
  const response = await api.delete(`/interaction/${mediaType}/${mediaId}`);
  return response.data;
}


export async function getInteraction({ queryKey }) {
  const { mediaId, mediaType } = queryKey[1];
  if (!mediaId) throw new Error('Media ID must be provided.');
  if (!mediaType) throw new Error('Media type must be provided.');
  const response = await api.get(`/interaction/check/${mediaType}/${mediaId}`);
  return response.data;
}


export const loadMediaData = async ({ queryKey }) => {
  const [mediaType, params] = queryKey;
  const { mediaId } = params;
  const response = await api.get(`/${mediaType}/${mediaId}`);
  const data = response.data;
  if (!data.success) throw new Error(data.status_message);
  return data;
}


export const loadRecommendations = async ({ queryKey }) => {
  const { movieId } = queryKey[1];
  const response = await api.get('/movie/' + movieId + '/recommendations');
  const data = response.data;
  if (!data.success) throw new Error(data.status_message);
  return data;
}


export const loadUserRecommendations = async () => {
  const response = await api.get('/movie/user-recommendations');
  return response.data;
}


export const loadMediaByGenre = async ({ queryKey }) => {
  const mediaType = queryKey[0];
  const { genre, orderBy='random', page = 1 } = queryKey[1];

  // cannot fetch movies by genre if genres weren't loaded
  if (!genre) return [];

  let url;
  if (genre) url = `/${mediaType}/genre/${genre}?page=${page}`;
  if (orderBy) url += '&orderBy=' + orderBy;
  const response = await api.get(url);
  return response.data;
}


export const loadGenres = async ({ queryKey }) => {
  const [mediaType] = queryKey;
  const response = await api.get(`/${mediaType}/genres`);
  const data = response.data;
  return data;
}