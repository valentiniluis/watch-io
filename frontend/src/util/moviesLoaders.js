import api from "../api/request.js";
import { mainGenres } from "./mainGenres.js";


export const loadHomepage = async () => {
  const homepageData = {};

  for (const genre of mainGenres) {
    const fetchGenre = fetchFn('/movies/genre/' + genre.id);
    homepageData[genre.name] = fetchGenre();
  }
  return homepageData;
}


export const loadInteractedMovies = async ({ interactionType }) => {
  let url = '/interactions';
  if (interactionType) url += `?interactionType=${interactionType}`;
  const loadFn = fetchFn(url);
  return await loadFn();
}


const fetchFn = (url) => {
  return async function () {
    const response = await api.get(url);
    const data = response.data;
    if (!data.success) throw new Error(data.status_message);
    return data;
  }
}