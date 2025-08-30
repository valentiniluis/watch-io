import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Authentication Required!' });

  const token = authHeader.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodedToken) return res.status(403).json({ success: false, message: 'Invalid Credentials'});

  req.user = decodedToken;
  next();
}