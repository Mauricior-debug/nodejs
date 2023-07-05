const mongoose = require('mongoose');

const connection = {};

async function connectServerDB() {
  if (connection.isConnected) {
    return;
  }
  MONGO_URI =
    "mongodb+srv://mauricio:nRdN4.553qv.5-n@cluster0.56vkw.mongodb.net/userBetting";

  const db = await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connection.isConnected = db.connections[0].readyState;
}

module.exports= connectServerDB;
