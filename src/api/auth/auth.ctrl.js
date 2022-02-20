import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { username, nickname, password } = req.body;
  try {
    const exists = await User.findByUsername(username);
    if (exists) return res.status(409).json('이미 존재하는 ID입니다.');
    const user = new User({ username, nickname });
    await user.setPassword(password);
    await user.save();
    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.json(user.serialize());
  } catch (e) {
    return res.status(500).json('오류가 발생했습니다.');
  }
};
export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(401).json('빈 칸이 있습니다.');
  try {
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json('존재하지 않는 ID입니다.');
    const valid = await user.checkPassword(password);
    if (!valid) return res.status(401).json('비밀번호가 틀렸습니다.');
    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.json(user.serialize());
  } catch (e) {
    return res.status(500).json('오류가 발생했습니다.');
  }
};
export const check = async (req, res) => {
  const token = req.cookies['access_token'];
  if (!token) return res.status(401).json('토큰이 없습니다.');
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) return res.status(401).json('토큰에 문제가 있습니다.');
    else return res.json(decoded.username);
  });
};
export const logout = async (req, res) => {
  res.cookie('access_token');
  return res.status(204).json();
};
export const checkid = async (req, res) => {
  const { username } = req.body;
  try {
    const exists = await User.findByUsername(username);
    return res.json(exists ? true : false);
  } catch (e) {
    return res.status(500).json('오류가 발생했습니다.');
  }
};
export const update = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
    if (!user) return res.status(404).json('존재하지 않는 계정입니다.');
    if (req.body.password) await user.setPassword(req.body.password);
    await user.save();
    return res.json(user);
  } catch (e) {
    return res.status(500).json('오류가 발생했습니다.');
  }
};
