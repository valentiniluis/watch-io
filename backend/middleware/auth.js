import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const cookies = req.cookies;
  const token = cookies.WATCHIO_JWT;

  if (!token) return res.status(401).json({ success: false, message: 'Credentials Not Provided' });

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodedToken) return res.status(401).json({ success: false, message: 'Invalid Credentials'});

  let userData = { ...decodedToken, id: decodedToken.sub };
  req.user = userData;
  next();
}

export const optionallyAuthenticateJWT = (req, res, next) => {
  const cookies = req.cookies;
  const token = cookies.WATCHIO_JWT;

  let decodedToken;
  if (token) decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!token || !decodedToken) return next();

  let userData = { ...decodedToken, id: decodedToken.sub };
  req.user = userData;
  next();
}