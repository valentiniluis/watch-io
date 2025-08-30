import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';


export const postLogin = async (req, res, next) => {
  const { credential, clientId } = req.body;

  if (!credential || !clientId) return res.status(400).json({ success: false, message: 'Failed to authenticate' });
  const client = new OAuth2Client(clientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });

    const payload = ticket.getPayload();
    const token = jwt.sign({
      sub: payload.sub,
      email: payload.email,
      name: payload.name
    },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );
    res.status(200).json({ success: true, message: 'Authentication successful', token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: 'Invalid Google Token' });
  }
}