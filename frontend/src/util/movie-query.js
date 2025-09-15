import api from "../api/request";


export async function fetchMovies({ queryKey }) {
  const parameters = queryKey[1];
  console.log(parameters);
  const { searchTerm, page = 1 } = parameters;
  let url = `/movies/search?page=${page}`;
  url += (searchTerm.length > 0) ? `&movie=${searchTerm}` : '';
  const response = await api.get(url);
  const { movies } = response.data;
  return movies;
}


export async function addInteraction({ movie, type }) {
  const response = await api.post(`/interactions/${type}`, movie);
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