import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const cookies = req.cookies;
  const token = cookies.WATCHIO_JWT;

  if (!token) return res.status(401).json({ success: false, message: 'Credentials Not Provided' });

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) throw new Error();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid Credentials'});
  }

  let userData = { ...decodedToken, id: decodedToken.sub };
  req.user = userData;
  next();
}

export const optionallyAuthenticateJWT = (req, res, next) => {
  const cookies = req.cookies;
  const token = cookies.WATCHIO_JWT;

  let decodedToken;
  try {
    if (token) decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // se não está autenticado, somente passa para o próximo middleware
    if (!token || !decodedToken) throw new Error('Not authenticated');
  }
  catch {
    return next();
  }

  // se está autenticado, grava os dados do user na request
  let userData = { ...decodedToken, id: decodedToken.sub };
  req.user = userData;
  next();
}