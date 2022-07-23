import Dotenv from 'dotenv';
Dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import colors from 'colors';

import jwtMiddleware from './src/lib/jwtMiddleware.js';
import api from './src/api/index.js';

import https from 'https';
import { Server } from 'socket.io';
import { sockets } from './src/socket/index.js';

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected!\n\n'.bold);
  })
  .catch((error) => console.log(error));

const app = express();

const option = {
  ca: fs.readFileSync(`${process.env.SSL_KEY_PATH}fullchain.pem`),
  key: fs.readFileSync(`${process.env.SSL_KEY_PATH}privkey.pem`),
  cert: fs.readFileSync(`${process.env.SSL_KEY_PATH}cert.pem`),
};

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(bodyParser.json());
app.use(cookieParser({ sameSite: 'none', secure: true }));
app.use(jwtMiddleware);

//라우팅
app.get('/', (req, res) => res.send('Hello! This is SimpleChat API.')); //for Test
app.use('/api', api);

//서버 켜기
const port = process.env.PORT || 4000;
const httpsServer = https.createServer(option, app).listen(port, () => {
  console.log(`[HTTPS] Server is started on port ${port}`);
});
export const io = new Server(httpsServer, {
  cors: { origin: '*' },
});

//Socket.io
io.on('connection', sockets);

export default app;
