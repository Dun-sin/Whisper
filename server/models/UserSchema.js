const mongoose = require('mongoose');

// user schema 
const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	gender: {
		type: String,
		required: false,
	  },
	  age: {
		type: Number,
		required: false,
	  },
	  aboutMe: {
		type: String,
		required: false,
	  },
});

UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
