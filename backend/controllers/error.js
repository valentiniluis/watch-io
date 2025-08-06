module.exports = errorHandler = (error, req, res, next) => {
  const httpStatusCode = error.statusCode || 500;
  const message = error.message;
  res.status(httpStatusCode).json({ success: false, message });
}