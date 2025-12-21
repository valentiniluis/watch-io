import { getMediaData } from "../util/api-util.js";
import { SERIES } from "../util/constants.js";
import { mediaIdValidation } from "../util/validationSchemas.js";


export const getSeriesData = async (req, res, next) => {
  try {
    // const { user } = req;
    const { value: seriesId, error } = mediaIdValidation.required().validate(req.params.seriesId);
    if (error) throwError(400, "Invalid TV Series: " + error.message);

    const { value: country, error: countryErr } = countryValidation.validate(req.query.country);
    if (countryErr) throwError(400, 'Invalid country: ' + countryErr.message);

    const responseData = await getMediaData(SERIES, seriesId, country);
    // const userData = {};
    // if (user) {
    //   userData.authenticated = true;
    //   const interactions = await getInteraction({ movieId, userId: user.id });
    //   if (interactions.length) {
    //     const [interaction] = interactions;
    //     userData[interaction.interaction_type] = true;
    //   }
    // }

    res.status(200).json({ success: true, seriesData: responseData }); // user: userData
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getSearchedSeries = async (req, res, next) => {
  try {
    const { user } = req;
    const [page, limit] = validatePage(req.query.page, req.query.limit);
    const { series } = req.query;

    const data = (series)
      ? await searchMedia({ movie, mediaType: SERIES, page, user, limit })
      : await discoverMedia({ page, mediaType: SERIES, user, limit })
      ;

    const finalData = getPagesAndClearData(data, limit, 'series');
    res.status(200).json({ success: true, ...finalData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getSeriesGenres = async (req, res, next) => {
  try {
    const { rows: genres } = await pool.query('SELECT * FROM series_genre ORDER BY genre_name;');
    res.status(200).json({ success: true, genres });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getSeriesByGenre = async (req, res, next) => {
  try {
    const id = req.user?.id;

    // guarantee that order by is in the allowed options so there's no injection in the query
    const { value: orderBy, error: orderByError } = orderByValidation.validate(req.query.orderBy);
    if (orderByError) throwError(400, 'Invalid sorting condition: ' + orderByError.message);

    const { error: genreError, value } = genreIdSchema.validate(req.params);
    if (genreError) throwError(400, 'Invalid genre: ' + genreError.message);

    const [page, limit] = validatePage(req.query.page, req.query.limit);
    const { genreId } = value;
    const parameters = { genreId, userId: id, limit, page };
    const [query, args] = getMovieGenreQuery(orderBy, id?.length > 0, parameters);

    const { rows: results } = await pool.query(query, args);
    const finalData = getPagesAndClearData(results, limit, 'movies');
    return res.status(200).json({ success: true, ...finalData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}
