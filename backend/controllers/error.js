export default function(error, req, res, next) {
  console.log(error);
  const httpStatusCode = error.statusCode || 500;
  const message = error.message;
  res.status(httpStatusCode).json({ success: false, message });
}