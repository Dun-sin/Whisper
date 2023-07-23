const User = require('./models/UserSchema');

const getProfile = (userId) => {
  return User.findById(userId);
};


module.exports = {getProfile};
