const app = require('express')();



const { json } = require('express');
var fs = require('fs');
const privateKey  = fs.readFileSync(__dirname + '/key.pem', 'utf8');
const certificate = fs.readFileSync(__dirname + '/cert.pem', 'utf8');


const credentials = {key: privateKey, cert: certificate};
//const http = require('http');
//const server = http.createServer(app);
const http = require('https');
const server = http.createServer(credentials,app);
const io = require("socket.io")(server, {});

let observerId = null;
let operatorId = null;
io.on('connection',socket=>{
  io.to(socket.id).emit('users',{
    'observerId':observerId,
    'operatorId':operatorId
  })
  socket.on('joinOperator',data=>{
    if (!operatorId) operatorId = socket.id;
    io.emit('users',{
      'observerId':observerId,
      'operatorId':operatorId
    })
    io.to(operatorId).emit('operatorJoined',{});
  })
  socket.on('joinObserver',data=>{
    if (!observerId) observerId = socket.id;
    io.emit('users',{
      'observerId':observerId,
      'operatorId':operatorId
    })
    io.to(observerId).emit('observerJoined',{});
  })

  socket.on('offer',sessionData=>{
    if (socket.id == observerId) {
      io.to(operatorId).emit('offerReady',sessionData)
    }
  })
  socket.on('answer',sessionData=>{
    if (socket.id == operatorId) {
      io.to(observerId).emit('answerReady',sessionData)
    }
  })
  socket.on('new-ice-candidate',data=>{
    console.log(data)
    io.emit('iceCandidate',data);
  })




})
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/mainapp.html');  
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});





