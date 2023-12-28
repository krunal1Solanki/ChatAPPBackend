 
const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const { Server } = require('socket.io');
app.use(cors());
 
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
 
let currentParagraph = "This is the default paragraph.";
let ready = [];
let map = new Map();
io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
    
    socket.on("ready", (data)=> {
          ready.push(data);
          if(ready.length == 2) {
            console.log(data)
            io.to(data).emit("start-match", data);
            ready = []
          }
        console.log(ready);
    })


    socket.on('exit-room', (roomId)=> {
        const val = map.get(roomId) - 1;
        map.set(roomId, val);
      io.to(roomId).emit("online-members", val); 

        console.log(map)
        
    })


    
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      const val = map.get(roomId) ? map.get(roomId) + 1 : 1;
      map.set(roomId, val);
      console.log(map);
      console.log(`User Id: ${socket.id}, room id: ${roomId}`);
      io.to(socket.id).emit("online-members", val); 
      // Send the current paragraph to the user who just joined
      io.to(socket.id).emit("current-paragraph", currentParagraph);
    });
  
    // server-side
    socket.on("send-message", (data) => {
      console.log(data);
      io.to(data.roomId).emit("receive-message", data);
    });
  
    socket.on("user-winner", ({ username, roomId }) => {
        io.to(roomId).emit("declare-winner", { username });
      });
    
  });
server.listen(4001, () => {
  console.log("Server running fine on 4001");
});