import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import db from '../model/db.js';
import { loginSchema } from '../util/validationSchemas.js';


export const postLogin = async (req, res, next) => {
  try {
    const loginData = { credential: req.body.credential, clientId: req.body.clientId };
    const { value, error } = loginSchema.validate(loginData);

    if (error) {
      const err = new Error("Invalid Input: " + error.message);
      err.statusCode = 400;
      throw err;
    }
    
    const { credential, clientId } = value;
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });

    const payload = ticket.getPayload();

    const { rows } = await db.query(`
      SELECT *
      FROM user_account AS us
      WHERE us.email = $1;`,
      [payload.email]
    );

    if (rows.length === 0) {
      await db.query(`
        INSERT INTO
        user_account(id, email, name)
        VALUES
        ($1, $2, $3);`,
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
    err.statusCode = 401;
    err.message = "Invalid Google Token";
    next(err);
  }
}


export const postLogout = async (req, res, next) => {
  res.clearCookie('WATCHIO_JWT', { httpOnly: true });
  return res.status(200).json({ success: true, message: 'Logout successful' });
}