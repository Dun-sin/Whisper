const crypto = require('crypto');

// Defining separate email validation middleware
const validator = require('validator').default;
const emailValidator = (req, res, next) => {
  const { email } = req.body;

  if (typeof email !== 'string' || !validator.isEmail(email)) {
    return res.status(NOT_ACCEPTABLE).json({
      message: 'Email is invalid',
    });
  } else {
    next();
  }
};

function generateObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

module.exports = {
  emailValidator,
  generateObjectId,
};
