import { io } from '../../index.js';
import * as message from './message.js';

let member = []; //nickname, username, id, order

const getOrder = ({ username, id }) => {
  let order = 1;
  let sameList = [];
  member.map((x) => {
    if (x.username === username && x.id !== id) sameList.push(x.order);
    return x;
  });
  while (true) {
    if (!sameList.includes(order)) break;
    order++;
  }
  return order;
};

export const AddMember = ({ socket, data }) => {
  let nickname;
  let username;
  let id = socket.id;
  let order;

  if (data) {
    username = data.username;
    order = getOrder({ username, id });
    nickname = order > 1 ? `${data.nickname}_${order}` : data.nickname;
  } else {
    username = '게스트';
    order = getOrder({ username, id });
    nickname = `유저_${order}`;
  }
  member.push({ nickname, username, id, order });

  console.log(`${`<Connect>`.bold.green} ${nickname.bold} ${username} ${`(${id.substr(0, 5)}..)`.grey}`);

  io.sockets.emit('memberChange', member);
  io.to(id).emit('introduce', { username, nickname, id });
};
export const LoginMember = ({ socket, data }) => {
  let nickname = data.nickname;
  let username = data.username;
  let id = socket.id;
  let order;
  let index = member.findIndex((x) => x.id === id);
  if (index < 0) {
    console.log(`${`<LoginError>`.bold.yellow} ${`알 수 없는 유저`.bgRed}`);
    return;
  }
  let pastname = member[index].nickname;

  order = getOrder({ username, id });
  nickname = order > 1 ? `${nickname}_${order}` : nickname;
  member[index] = { nickname, username, id, order };

  console.log(`${`<Login>`.bold.green} ${pastname} ===> ${nickname.bold} ${username} ${`(${id.substr(0, 5)}..)`.grey}`);

  io.sockets.emit('memberChange', member);
  io.to(id).emit('introduce', { username, nickname, id });
};
export const LogoutMember = (socket) => {
  let nickname = `유저`;
  let username = '게스트';
  let id = socket.id;
  let order;
  let index = member.findIndex((x) => x.id === id);
  if (index < 0) {
    console.log(`${`<LogoutError>`.bold.yellow} ${`알 수 없는 유저`.bgRed}`);
    return;
  }
  let target = member[index];

  order = getOrder({ username, id });
  nickname = `유저_${order}`;
  member[index] = { nickname, username, id, order };

  console.log(
    `${`<Logout>`.bold.green} ${target.nickname.bold} ${target.username} ===> ${nickname.bold} ${
      `(${id.substr(0, 5)}..)`.grey
    }`,
  );

  io.sockets.emit('memberChange', member);
  io.to(id).emit('introduce', { username, nickname, id });
};
export const editProfileMember = ({ socket, data }) => {
  let nickname = data.nickname;
  let username = data.username;
  let id = socket.id;
  let order;
  let index = member.findIndex((x) => x.id === id);
  if (index < 0) {
    console.log(`${`<EditError>`.bold.yellow} ${`알 수 없는 유저`.bgRed}`);
    return;
  }
  let pastname = member[index].nickname;

  order = getOrder({ username, id });
  nickname = order > 1 ? `${nickname}_${order}` : nickname;
  member[index] = { nickname, username, id, order };

  console.log(
    `${`<Edit>`.bold.green} ${pastname} ===> ${`${nickname}`.bold} ${username} ${`(${id.substr(0, 5)}..)`.grey}`,
  );

  io.sockets.emit('memberChange', member);
  io.to(id).emit('introduce', { username, nickname, id });
};
export const DeleteMember = (socket) => {
  let index = member.findIndex((x) => x.id === socket.id);
  if (index < 0) {
    console.log(`${`<DeleteError>`.bold.yellow} ${`알 수 없는 유저`.bgRed}`);
    return;
  }
  let target = member[index];

  member.splice(index, 1);

  console.log(
    `${`<Disconnect>`.bold.red} ${`${target.nickname}`.bold} ${target.username} ${
      `(${target.id.substr(0, 5)}..)`.grey
    }`,
  );

  io.sockets.emit('memberChange', member);
};

export const GetMember = (socket) => {
  io.to(socket.id).emit('memberChange', member);
};
