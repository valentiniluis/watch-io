import { URL_SEGMENTS } from "../util/constants.js"
import { mapUrlMediaToConstant } from "../util/util-functions.js";
import { mediaTypeValidation } from '../util/validationSchemas.js';


export const validateMediaType = (req, res, next) => {
  const rawMediaType = req.params.mediaType || req.body?.mediaType;

  const { error, value: mediaType } = mediaTypeValidation.validate(rawMediaType);

  if (!error) {
    const mappedMediaType = mapUrlMediaToConstant(mediaType);
    req.mediaType = mappedMediaType;
    return next();
  };

  const validOptions = Object.values(URL_SEGMENTS).map(t => `'${t}'`).join(', ');
  const newErr = new Error(`Invalid media type. Valid options are ${validOptions}.`);
  newErr.statusCode = 400;
  next(newErr);
}


export const mapMediaType = (req, res, next) => {
  const rawMediaType = req.params[0];
  const mediaType = mapUrlMediaToConstant(rawMediaType);
  req.mediaType = mediaType;
  next();
}