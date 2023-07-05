const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "userBettingSchema" },
  ],
  status: { type: String, enum: ["active", "finished"], default: "active" },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "userBettingSchema" },
  amount: { type: Number, required: true },
  outcome: { type: String, enum: ["win", "lose"] },
  // ... other bet fields
});
module.exports =
  mongoose.models.betSchema || mongoose.model("betSchema", betSchema);
