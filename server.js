const path = require('path');
const http = require('http'); //used to create a server used by express
const express = require('express');
const socketio= require('socket.io');
const formatMessage=require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
}=require('./utils/user');

const app = express();
const server=http.createServer(app);
const io=socketio(server)


//to set public as static folder
app.use(express.static(path.join(__dirname,'public')));

const botName = "Chatcord bot";


//run when client connects--listen for connection
io.on('connection',socket =>{

  //1.add the new user to the user list  and inform all the users abt the entry
  socket.on('joinRoom',({username,room})=>{
    const user=userJoin(socket.id,username,room);
    socket.join(user.room);
    //welcome current user
    socket.emit('message',formatMessage(botName,'Welcome to Chatcord!')); //calls the format messgae in utils--sending to client side(main.js) from server
    //broadcast when user connects
    //2.to emit to a specific room to(user.room)
    socket.broadcast.to(user.room).emit(
      'message',
      formatMessage(botName,`A ${user.username} has joined !`));
    //send users and room info
    io.to(user.room).emit('roomUsers',{
      room:user.room,
      users:getRoomUsers(user.room)
    });
  });


  ///3.listen for chat message from user
  socket.on('chatMessage',msg =>{
    const user = getCurrentUser(socket.id); //returns an object tap into the room no and username and properties using '.'
    io.to(user.room).emit('message',formatMessage(user.username,msg));
  });

  //broadcase when user disconnects
  socket.on('disconnect',()=>{
    const user=userLeave(socket.id); //returns an object tap into the room no and username and properties using '.'
    if(user){
      io.to(user.room).emit(
        'message',
        formatMessage(botName,`${user.username} has left !`));
      io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
      });
    }

  });

});
const PORT =3000 || process.env.PORT; //looks for a variable named PORT or uses 3000 directly

server.listen(PORT,() =>console.log(`Server running on port ${PORT}`));
