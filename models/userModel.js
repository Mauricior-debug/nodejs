const mongoose = require('mongoose');

const userBettingSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "a user must have a userName"],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  termsConditions: {
    type: Boolean,
    default: true,
  },
  slug: String,

  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "a user must have an email"],
  },
  firstname: {
    type: String,
    required: [true, "A user must have a first name"],
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
    required: [true, "A user must have a last name"],
  },
  addres: {
    type: String,
    required: [true, "A user must have an address"],
  },
  city: {
    type: String,
    trim: true,
    required: [true, "A user must have a city"],
  },
  country: {
    type: String,
    trim: true,
    required: [true, "A user must have a country"],
  },
  state: {
    type: String,
    trim: true,
    required: [true, "A user must have a state"],
  },
  postcode: {
    type: String,
    trim: true,
    required: [true, "A user must have a postal code"],
  },

  stripecustomer: {
    type: String,
  },
  image: {
    type: String,
    default: "default.jpg",
  },
  stripeAccount: {
    type: String,
  },

  phone: {
    type: Number,
    required: [true, "A user must have a phone number"],
  },
  description: {
    type: String,
    trim: true,
    default: "Hi, welcome eto the Bet all",
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userBettingSchema",
    },
  ],
  friendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userBettingSchema",
    },
  ],
  funds: {
    type: Number,
    default: 0,
    min: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    select: true,
  },
});
// Accept friend request
userBettingSchema.methods.acceptFriendRequest = async function (friendId) {
  if (!this.friendRequests.includes(friendId)) {
    throw new Error("No friend request found for the given friendId");
  }

  this.friendRequests = this.friendRequests.filter(
    (requestId) => requestId.toString() !== friendId.toString()
  );
  this.friends.push(friendId);

  await this.save();
};

// Decline friend request
userBettingSchema.methods.declineFriendRequest = async function (friendId) {
  if (!this.friendRequests.includes(friendId)) {
    throw new Error("No friend request found for the given friendId");
  }

  this.friendRequests = this.friendRequests.filter(
    (requestId) => requestId.toString() !== friendId.toString()
  );

  await this.save();
};

// Other methods...

module.exports = mongoose.models.userBettingSchema || mongoose.model('userBettingSchema', userBettingSchema);
