import api from "../api/client";


export async function fetchMedia({ queryKey }) {
  const [mediaType, params] = queryKey;
  const { searchTerm, page = 1 } = params;
  let url = `/${mediaType}/search?page=${page}`;
  url += (searchTerm.length > 0) ? `&title=${searchTerm}` : '';
  const response = await api.get(url);
  const data = response.data;
  return data;
}


export const loadMediaData = async ({ queryKey }) => {
  const [mediaType, params] = queryKey;
  const { mediaId } = params;
  const response = await api.get(`/${mediaType}/${mediaId}?country=BR`);
  const data = response.data;
  if (!data.success) throw new Error(data.status_message);
  return data;
}


export const loadRecommendations = async ({ queryKey }) => {
  const [mediaType, params] = queryKey;
  const { mediaId } = params;
  const url = `/${mediaType}/${mediaId}/recommendations`;
  const response = await api.get(url);
  const data = response.data;
  if (!data.success) throw new Error(data.status_message);
  return data;
}


export const loadUserRecommendations = async ({ queryKey }) => {
  const [mediaType] = queryKey;
  const url = `/${mediaType}/user-recommendations`;
  const response = await api.get(url);
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