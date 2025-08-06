import api from "../api/request.js";


export const loadSingleMovieData = async ({ params }) => {
  const { movieId } = params;
  try {
    const url = '/movies/' + movieId;
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