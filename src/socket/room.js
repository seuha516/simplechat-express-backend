import { io } from '../../index.js';

let room = []; //name, password, maximum, code, member, color
let roomNumber = 1;
let chatNumber = 1;

export const CreateRoom = ({ socket, data }) => {
  const getColor = () => {
    const list = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    return `#f${list[Math.floor(Math.random() * 16)]}f${list[Math.floor(Math.random() * 16)]}f${
      list[Math.floor(Math.random() * 16)]
    }`;
  };
  let code = `${socket.id}${roomNumber}`;
  roomNumber++;
  room.push({ ...data, code, member: [], color: getColor() });

  console.log(
    `${`<CreateRoom>`.bold.blue} ${data.name.bold} ${code.substr(0, 5).italic} ${
      `${data.maximum}인, PW: ${data.password === '' ? '없음' : data.password.substr(0, 5)}`.gray
    }`,
  );

  io.sockets.emit('roomChange', room);
  io.to(socket.id).emit('inviteRoom', code);
};
export const TryRoom = ({ socket, data }) => {
  let index = room.findIndex((x) => x.code === data);
  let target = room[index];

  if (!target) io.to(socket.id).emit('allowRoom', null);
  else if (target.password !== '' && target.member.length > 0) io.to(socket.id).emit('allowRoom', target.password);
  else io.to(socket.id).emit('allowRoom', null);
};
export const JoinRoom = ({ socket, data }) => {
  let user = data.user;
  let code = data.code;
  let index = room.findIndex((x) => x.code === code);
  let target = room[index];

  if (code === 'lobby') {
    socket.join('lobby');
    console.log(`${`<Join>`.bold.cyan} ${`lobby`.bold} <--- ${user.nickname.bold} ${user.username}`);
  } else if (!target) {
    io.to(socket.id).emit('wrongRoom', '존재하지 않는 방입니다.');
    console.log(`${`<JoinError>`.bold.yellow} 존재하지 않는 방`);
  } else if (target.member.length >= target.maximum) {
    io.to(socket.id).emit('wrongRoom', '최대 인원수를 초과했습니다.');
    console.log(`${`<JoinError>`.bold.yellow} ${target.name.bold}: 인원 초과`);
  } else {
    socket.join(code);
    room[index].member.push({ ...user, admin: target.member.length === 0 });

    console.log(`${`<Join>`.bold.cyan} ${target.name.bold} <--- ${user.nickname.bold} ${user.username}`);

    io.sockets.emit('roomChange', room);
    io.to(code).emit('roomMemberChange', room[index].member);
    io.to(socket.id).emit('roomInfoChange', {
      name: target.name,
      password: target.password,
      maximum: target.maximum,
      code: target.code,
    });
    io.to(code).emit('messageChange', {
      chatid: `${socket.id}notice${chatNumber}`,
      user: 'notice',
      type: 'enter',
      target: user,
    });
    chatNumber++;
  }
};
export const EditRoomInfo = ({ socket, data }) => {
  let index = room.findIndex((x) => x.code === data.code);
  let target = room[index];

  if (!target) {
    console.log(`${`<EditRoomInfoError>`.bold.yellow} 존재하지 않는 방`);
  } else {
    room[index].name = data.name;
    room[index].password = data.password;
    room[index].maximum = data.maximum;

    console.log(
      `${`<EditRoom>`.bold.blue} ${room[index].code.substr(0, 5).italic} ~~> ${room[index].name} ${
        `${room[index].maximum}인, PW: ${room[index].password === '' ? '없음' : room[index].password.substr(0, 5)}`.gray
      }`,
    );

    io.sockets.emit('roomChange', room);
    io.to(data.code).emit('roomInfoChange', {
      name: room[index].name,
      password: room[index].password,
      maximum: room[index].maximum,
      code: room[index].code,
    });
    io.to(data.code).emit('messageChange', {
      chatid: `${socket.id}notice${chatNumber}`,
      user: 'notice',
      type: 'edit',
      target: room[index],
    });
    chatNumber++;
  }
};
export const LeaveRoom = ({ socket, data }) => {
  let user = data.user;
  let code = data.code;
  let index = room.findIndex((x) => x.code === code);
  let target = room[index];

  if (code === 'lobby') {
    socket.leave('lobby');
    console.log(`${`<Leave>`.bold.cyan} ${`lobby`.bold} ---> ${user.nickname.bold} ${user.username}`);
  } else if (!target) {
    console.log(`${`<LeaveError>`.bold.yellow} 존재하지 않는 방`);
  } else {
    let memberIndex = target.member.findIndex((x) => x.id === socket.id);
    let targetMember = target.member[memberIndex];
    if (targetMember) {
      socket.leave(code);
      room[index].member.splice(memberIndex, 1);

      console.log(`${`<Leave>`.bold.cyan} ${target.name.bold} ---> ${user.nickname.bold} ${user.username}`);

      if (room[index].member.length === 0) {
        console.log(`${`<Close>`.bold.cyan} ${target.name.bold}`);
        room.splice(index, 1);
        io.sockets.emit('roomChange', room);
      } else {
        io.to(code).emit('messageChange', {
          chatid: `${socket.id}notice${chatNumber}`,
          user: 'notice',
          type: 'leave',
          target: targetMember,
        });
        chatNumber++;
        if (targetMember.admin) {
          let peopleNumber = room[index].member.length;
          let randomNumber = Math.floor(Math.random() * peopleNumber);
          room[index].member[randomNumber].admin = true;

          io.to(code).emit('messageChange', {
            chatid: `${socket.id}notice${chatNumber}`,
            user: 'notice',
            type: 'king',
            target: room[index].member[randomNumber],
          });
          chatNumber++;
        }
        io.sockets.emit('roomChange', room);
        io.to(code).emit('roomMemberChange', room[index].member);
      }
    } else {
      console.log(`${`<LeaveError>`.bold.yellow} 존재하지 않는 유저`);
    }
  }
};
export const DisconnectRoom = (socket) => {
  room.map((x) => {
    let exist = x.member[x.member.findIndex((x) => x.id === socket.id)];
    if (exist) {
      LeaveRoom({ socket, data: { user: exist, code: x.code } });
    }
    return x;
  });
};

export const GiveCrown = ({ socket, data }) => {
  let user = data.user;
  let code = data.code;
  let index = room.findIndex((x) => x.code === code);
  if (index < 0) {
    console.log(`${`<GiveCrownError>`.bold.yellow} 존재하지 않는 방`);
    return;
  }

  let pastKingIndex = room[index].member.findIndex((x) => x.id === socket.id);
  if (pastKingIndex < 0) {
    console.log(`${`<GiveCrownError>`.bold.yellow} 존재하지 않는 멤버`);
    return;
  }
  let nextKingIndex = room[index].member.findIndex((x) => x.id === user.id);
  if (nextKingIndex < 0) {
    console.log(`${`<GiveCrownError>`.bold.yellow} 존재하지 않는 멤버`);
    return;
  }

  console.log(
    `${`<giveCrown>`.bold.blue} ${room[index].name.bold} : ${room[index].member[pastKingIndex].nickname} ~~~> ${
      room[index].member[nextKingIndex].nickname
    }`,
  );

  room[index].member[pastKingIndex].admin = false;
  room[index].member[nextKingIndex].admin = true;

  io.to(code).emit('roomMemberChange', room[index].member);
  io.to(code).emit('messageChange', {
    chatid: `${socket.id}notice${chatNumber}`,
    user: 'notice',
    type: 'king',
    target: room[index].member[nextKingIndex],
  });
  chatNumber++;
};
export const GiveKick = ({ socket, data }) => {
  console.log(`${`<giveKick>`.bold.blue} ${data.user.nickname.bold}`);

  io.to(data.code).emit('messageChange', {
    chatid: `${socket.id}notice${chatNumber}`,
    user: 'notice',
    type: 'kick',
    target: data.user,
  });
  chatNumber++;
  io.to(data.user.id).emit('kicked');
};

export const GetRoom = (socket) => {
  io.to(socket.id).emit('roomChange', room);
};
