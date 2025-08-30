import { QueryClient } from "@tanstack/react-query";
import api from "../api/request";


export const queryClient = new QueryClient();


export async function fetchMovies({ signal, search }) {
  const queryParam = (search.length > 0) ? `?movie=${search}` : '';
  const response = await api.get('/movies/search' + queryParam);
  const { movies } = response.data;
  return movies;
}