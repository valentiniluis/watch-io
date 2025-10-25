import Joi from "joi";


export const loginSchema = Joi.object({
  credential: Joi.string().required(),
  clientId: Joi.string().required()
});


export const movieSchema = Joi.object({
  id: Joi.number().positive().required(),
  title: Joi.string().required(),
  poster_path: Joi.string().uri(),
  year: Joi.number().positive(),
  tmdb_rating: Joi.number().positive()
});


export const interactionSchema = Joi.object({
  movieId: Joi.number().positive().required(),
  interactionType: Joi.string().valid("not interested", "watchlist", "like").required()
});


export const movieIdSchema = Joi.object({
  movieId: Joi.number().positive().required()
});

export const genreIdSchema = Joi.object({
  genreId: Joi.number().positive().required()
});