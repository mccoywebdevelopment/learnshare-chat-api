const app = require('express')();
const http = require('http').Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});
const PORT = process.env.PORT || 4000;

io.on('connection', function(socket){
  console.log('con')
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

app.get('/',function(req,res){
  res.send('test')
});

http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});
