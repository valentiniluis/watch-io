import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { loginSchema } from '../util/validationSchemas.js';
import { throwError } from '../util/util-functions.js';
import pool from '../model/postgres.js';


export const postLogin = async (req, res, next) => {
  try {
    const loginData = { credential: req.body.credential, clientId: req.body.clientId };
    const { value, error } = loginSchema.validate(loginData);
    if (error) throwError(400, `Invalid Input: ${error.message}`);

    const { credential, clientId } = value;
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });

    const payload = ticket.getPayload();

    await pool.query(`
      INSERT INTO
      user_account(id, email, username)
      VALUES
      ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING;`,
      [payload.sub, payload.email, payload.name]
    )

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
    next(err);
  }
}


export const postLogout = async (req, res, next) => {
  res.clearCookie('WATCHIO_JWT', { httpOnly: true });
  return res.status(200).json({ success: true, message: 'Logout successful' });
}