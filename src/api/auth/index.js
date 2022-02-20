import { Router } from 'express';
import * as authCtrl from './auth.ctrl.js';

const auth = new Router();

auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', authCtrl.check);
auth.post('/logout', authCtrl.logout);
auth.post('/checkid', authCtrl.checkid);
auth.post('/update/:id', authCtrl.update);

export default auth;
