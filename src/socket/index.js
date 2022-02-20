import * as member from './member.js';
import * as room from './room.js';
import * as message from './message.js';

export const sockets = (socket) => {
  socket.on('init', (data) => member.AddMember({ socket, data }));
  socket.on('login', (data) => member.LoginMember({ socket, data }));
  socket.on('logout', () => member.LogoutMember(socket));
  socket.on('editProfile', (data) => member.editProfileMember({ socket, data }));

  socket.on('createRoom', (data) => room.CreateRoom({ socket, data }));
  socket.on('tryRoom', (data) => room.TryRoom({ socket, data }));
  socket.on('joinRoom', (data) => room.JoinRoom({ socket, data }));
  socket.on('leaveRoom', (data) => room.LeaveRoom({ socket, data }));
  socket.on('editRoomInfo', (data) => room.EditRoomInfo({ socket, data }));
  socket.on('giveCrown', (data) => room.GiveCrown({ socket, data }));
  socket.on('giveKick', (data) => room.GiveKick({ socket, data }));

  socket.on('createMessage', (data) => message.CreateMessage({ socket, data }));

  socket.on('renderHome', () => {
    member.GetMember(socket);
    room.GetRoom(socket);
  });

  socket.on('disconnect', () => {
    member.DeleteMember(socket);
    room.DisconnectRoom(socket);
  });
};
