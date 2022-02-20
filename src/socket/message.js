import { io } from '../../index.js';

let chatNumber = 1;

export const CreateMessage = ({ socket, data }) => {
  console.log(
    `${`<Message>`.bold.magenta} ${data.location.substr(0, 5).italic} ${
      `${data.user.nickname}(${data.user.username})`.bold
    } : ${data.value}`,
  );
  io.to(data.location).emit('messageChange', {
    chatid: `${socket.id}${chatNumber}`,
    ...data.user,
    value: data.value,
  });
  chatNumber++;
};
