import api from "../api/request.js";

export const loadSelectedMovie = async ({ params }) => {
  const { movieId } = params;

  const recommendationsURL = '/movies/' + movieId + '/recommendations';
  const loadRecommendations = fetchFn(recommendationsURL);

  const movieDataURL = '/movies/' + movieId;
  const loadMovieData = fetchFn(movieDataURL);

  return {
    movie: loadMovieData(),
    recommendations: loadRecommendations()
  };
}

const fetchFn = (url) => {
  return async function () {
    try {
      const response = await api.get(url);
      const data = response.data;
      if (!data.success) throw new Error(data.status_message);
      return data;
    } catch (error) {
      console.log(error);
      return {
        isError: true,
        message: error.response?.data?.message || "Failed to load data"
      };
    }
  }
}