const mongoose = require('mongoose');

// User schema
const UserSchema = new mongoose.Schema({
  _id: String,
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown'],
    required: false,
    default: 'Unknown',
  },
  age: {
    type: Number,
    required: false,
    default: null,
  },
  username: {
    type: String,
    required: false,
    default: 'Anonymous',
  },
  aboutMe: {
    type: String,
    required: false,
  },
  settings: {
    type: Object,
    required: false,
  },
});

UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
