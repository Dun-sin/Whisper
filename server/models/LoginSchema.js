const mongoose = require('mongoose');

const LoginSchema = new mongoose.Schema({
    loggedInAt: {
        type: Date,
        default: Date.now
    },
	loginId: {
		type: String,
		required: true,
	},
});

LoginSchema.index({ loginId: 1 }, { unique: true });

module.exports = mongoose.model('Login', LoginSchema);
