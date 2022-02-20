import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const jwtMiddleware = async (req, res, next) => {
  const token = req.cookies['access_token'];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decoded._id);
      const token = user.generateToken();
      res.cookie('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
    }
    return next();
  } catch (e) {
    return next();
  }
};

export default jwtMiddleware;
