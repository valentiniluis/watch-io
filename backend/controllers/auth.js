import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import db from '../model/db.js';


export const postLogin = async (req, res, next) => {
  const { credential, clientId } = req.body;

  if (!credential || !clientId) return res.status(400).json({ success: false, message: 'Credentials were not provided.' });
  const client = new OAuth2Client(clientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });

    const payload = ticket.getPayload();

    const { rows } = await db.query(`
        SELECT *
        FROM watchio.user AS us
        WHERE us.email = $1;
      `,
      [payload.email]
    );

    if (rows.length === 0) {
      await db.query(`
        INSERT INTO
        watchio.user(id, email, name)
        VALUES
        ($1, $2, $3);
        `,
        [payload.sub, payload.email, payload.name]
      );
    }

    const token = jwt.sign({
      sub: payload.sub,
      email: payload.email,
      name: payload.name
    },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.cookie('WATCHIO_JWT', token, { httpOnly: true });
    res.status(200).json({ success: true, message: 'Authentication successful', token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: 'Invalid Google Token' });
  }
}