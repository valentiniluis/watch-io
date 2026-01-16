import Joi from "joi";
import { LIKE, NOT_INTERESTED, URL_SEGMENTS, WATCHLIST } from "./constants.js";

export const orderByValidation = Joi.string().valid('title.asc', 'title.desc', 'release_year.asc', 'release_year.desc', 'tmdb_rating.asc', 'tmdb_rating.desc', 'random').optional().default('random');

export const booleanValidation = Joi.boolean().optional();

export const intValidation = Joi.number().integer().positive().optional();

export const limitValidation = Joi.number().integer().positive().optional().max(50).default(25);

export const pageValidation = intValidation.default(1);

export const countryValidation = Joi.string().length(2).uppercase().default('US');

export const mediaIdValidation = intValidation.required();

export const genreIdValidation = intValidation.required();

export const interactionTypeValidation = Joi.string().valid(NOT_INTERESTED, WATCHLIST, LIKE).optional();

export const mediaTypeValidation = Joi.string().valid(...Object.values(URL_SEGMENTS)).required();

export const loginSchema = Joi.object({
  credential: Joi.string().required(),
  clientId: Joi.string().required()
});

export const interactionSchema = Joi.object({
  mediaId: mediaIdValidation,
  mediaType: mediaTypeValidation,
  interactionType: interactionTypeValidation.required()
});

export const ratingSchema = Joi.object({
  mediaId: mediaIdValidation,
  mediaType: mediaTypeValidation,
  score: intValidation.min(1).max(10).required(),
  headline: Joi.string().required(),
  note: Joi.string().max(511).optional()
});
