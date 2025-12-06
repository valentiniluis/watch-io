import Joi from "joi";


export const orderByValidation = Joi.string().valid('title.asc', 'title.desc', 'year.asc', 'year.desc', 'tmdb_rating.asc', 'tmdb_rating.desc', 'random').optional().default('random');

export const limitValidation = Joi.number().integer().positive().optional().max(50).default(30);

export const pageValidation = Joi.number().integer().positive().optional().default(1);

export const countryValidation = Joi.string().length(2).uppercase().default('US');

export const movieIdValidation = Joi.number().integer().positive();

export const interactionTypeValidation = Joi.string().valid('not interested', 'watchlist', 'like').optional();

export const loginSchema = Joi.object({
  credential: Joi.string().required(),
  clientId: Joi.string().required()
});

export const movieSchema = Joi.object({
  id: Joi.number().positive().required(),
  title: Joi.string().required(),
  poster_path: Joi.string().uri(),
  year: Joi.number().positive(),
  tmdb_rating: Joi.number().positive().max(10)
});

export const interactionSchema = Joi.object({
  movieId: Joi.number().positive().required(),
  interactionType: Joi.string().valid("not interested", "watchlist", "like").required()
});

export const genreIdSchema = Joi.object({
  genreId: Joi.number().positive().required()
});

export const ratingSchema = Joi.object({
  movieId: movieIdValidation.required(),
  score: Joi.number().min(1).max(10).integer().required(),
  headline: Joi.string().required(),
  note: Joi.string().max(511).optional()
});
