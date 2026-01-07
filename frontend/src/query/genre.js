import api from "../api/client";


export const loadGenres = async ({ queryKey }) => {
  const [mediaType] = queryKey;
  const response = await api.get(`/${mediaType}/genres`);
  const data = response.data;
  return data;
}


export const loadHomepageGenres = async ({ queryKey }) => {
  const [mediaType, params] = queryKey;
  const { limit, randomize } = params;
  const url = `/${mediaType}/genres?limit=${limit}&randomize=${randomize}`;
  const response = await api.get(url);
  return response.data;
}