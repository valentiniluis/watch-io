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
