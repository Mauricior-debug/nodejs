const http = require('http');
const port = process.env.PORT ||  3000;
const sv = require("socket.io");
const userModel = require("./models/userModel");
const { default: mongoose } = require("mongoose");
const betModels = require("./models/betModelsServer");

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Connected!');
});

const io = new sv.Server(server, {
  cors: {
    origin: "*",
  },
});
// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://mauricio:nRdN4.553qv.5-n@cluster0.56vkw.mongodb.net/userBetting",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });
// WebSocket connection handler
io.on("connection", (socket) => {
  socket.setMaxListeners(30); // Increase the maximum to 20

  socket.on("userConnected", (userId, userDatas) => {
    console.log("👤🟢", userDatas?.username);
    console.log(userDatas?.username);
    activeUsers[userId] = socket.id;

    // Notify all users about the updated list of active users
    io.emit("activeUsers", Object.keys(activeUsers));
  });

  // When a user joins a room
  socket.on("joinRoom", async ({ roomId, userId }) => {
    let users = [];
    const userIds = roomId.split("game-")[1].split("-");

    for (let id of userIds) {
      const user = await userModel.findById({ _id: id });

      if (!user) {
        console.log(`User with ID: ${id} not found in database.`);
        return;
      }
      // console.log(id)
      users.push(user);
    }

    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }
    rooms[roomId][userId] = socket.id;
    socket.join(roomId);
    console.log(`🎲 ${userId} joined room ${roomId}`);

    // Notify all users in the room about the current list of users.
    io.in(roomId).emit("roomUsers", Object.keys(rooms[roomId]), users);
    // Notify all users about the updated list of active users
    io.emit("activeUsers", Object.keys(activeUsers));
  });

  socket.on("sendGameInvite", (data) => {
    const { senderId, receiverId, roomId } = data;

    const receiverSocketId = activeUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("gameInvite", { senderId, receiverId });
    }
  });

  socket.on("gameInviteResponse", async (data) => {
    const { invite, accepted, betAmounts } = data;
    const senderSocketId = activeUsers[invite.senderId];
    const receiverSocketId = activeUsers[invite.receiverId];
    console.log("📨", betAmounts);

    if (accepted) {
      console.log("📨", accepted, invite, betAmounts);

      // await betModels.create({
      //   name: `room-${invite.senderId}-${invite.receiverId} `,
      //   participants: [invite.senderId, invite.receiverId],
      //   status: "active",
      //   amount,
      // });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("gameInviteResponse", { invite, accepted });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("gameInviteResponse", { invite, accepted });
    }
  });

  // Server-side code
  socket.on("createGameRoom", (data) => {
    const { roomId, players } = data;
    socket.join(roomId);

    // Notify the client about the game start

    io.to(roomId).emit("gameStart", { roomId, players });
  });

  // Inside your connection event
  socket.on("leaveRoom", ({ roomId, userId }) => {
    socket.leave(roomId);
    console.log(`👤 ${userId} left room ${roomId}`);

    // Remove user from room data
    if (rooms[roomId]) {
      delete rooms[roomId][userId];

      // If the room is empty, delete it
      if (Object.keys(rooms[roomId]).length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} is empty and has been deleted.`);
      }
    }
    // Notify all users in the room about the current list of users.
    io.in(roomId).emit("roomUsers", Object.keys(rooms[roomId] || {}));

    // Notify all users about the updated list of active users
    io.emit("activeUsers", Object.keys(activeUsers));
  });

  socket.on("rollDice", (data) => {
    const { roomId, userId } = data;
    // Determine dice roll result
    const minValue = 1;
    const maxValue = 6;
    const newValue =
      Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    // Broadcast result to all users in the room

    io.in(roomId).emit("diceRollResult", { value: newValue });
  });

  // Event handler for disconnections
  socket.on("disconnect", () => {
    const disconnectedUserId = Object.keys(activeUsers).find(
      (key) => activeUsers[key] === socket.id
    );

    if (disconnectedUserId) {
      console.log("user disconnected!");
      delete activeUsers[disconnectedUserId];

      // Remove user from all rooms
      for (let roomId in rooms) {
        if (rooms[roomId][disconnectedUserId]) {
          delete rooms[roomId][disconnectedUserId];

          console.log(`User ${disconnectedUserId} left room ${roomId}`);

          // Notify all users in the room about the current list of users.
          io.in(roomId).emit("roomUsers", Object.keys(rooms[roomId]));
        }
      }

      // Notify all users about the updated list of active users
      io.emit("activeUsers", Object.keys(activeUsers));
    }
  });
});
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

server.listen(port, () => {
  console.log(`Server running at por:${port}`);
});
