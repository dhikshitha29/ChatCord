//frontend javascript-- client
const chatForm  = document.getElementById('chat-form'); // to id -chatform event listener
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//getting username and room from url
const { username,room } = Qs.parse(location.search,{

  ignoreQueryPrefix:true, //ignore the qnmarks
});
const socket = io(); //after establishing connection in server.js and html file

//1. client join chatroom
socket.emit('joinRoom',{username,room});

//get room and roomUsers
socket.on('roomUsers',({room,users})=>{
  outputRoomName(room);
  outputUsers(users);
});


//capturing the welcome to chatcord from server--message from server
//2.all the messages from server captured here
socket.on('message',(message)=>{
  console.log(message);    //print message from server side--need not log it here so need for dom manip
  outputMessage(message); // call the output message function

  //Scroll down chatmessages div where the list of messages are displayed
  chatMessages.scrollTop=chatMessages.scrollHeight;
});

//message submit --form submits to a file to prevent that e.prevent
chatForm.addEventListener('submit',(e) => {
  e.preventDefault();

  //getting message text
  const msg=e.target.elements.msg.value; //getting the text input entered by th user

  //3.emit message to server
  socket.emit('chatMessage',msg);
  //emit the input bar--clear the input messages
  e.target.elements.msg.value=""; //clear the input accordingly
  e.target.elements.msg.focus();


});

//whenever new message sent adds a new div to display the messgae
function outputMessage(message){
  const div = document.createElement('div'); //insert the messages sent by the user,msg and time in the container 
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class ="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

//add room name to dom
function outputRoomName(room){
  roomName.innerText = room; //insert the roomname in the left pane

}

//add users to dom function
function outputUsers(users){
  userList.innerHTML=`
  ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}
