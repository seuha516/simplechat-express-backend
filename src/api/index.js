import { Router } from 'express';
import auth from './auth/index.js';

const api = new Router();

api.use('/auth', auth);

export default api;
