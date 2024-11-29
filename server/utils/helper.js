const crypto = require('crypto');
const { NOT_ACCEPTABLE } = require('../httpStatusCodes');

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

const validateUserID = (req, res, next) => {
  const { id } = req.body;
  const userIDPattern = /^[a-z0-9]{12}$/;

  // If id is required and not present or invalid, reject the request
  if (!id || typeof id !== 'string' || !userIDPattern.test(id)) {
    return res.status(406).json({
      message: 'Invalid login Id.'
    });
  }

  // If id is valid, proceed to the next middleware
  next();
}

module.exports = {
  emailValidator,
  generateObjectId,
  validateUserID,
};
