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

const validateUserID = (req, res, next) => {
  const {id} = req.body;
	const userIDPattern = /^[a-z0-9]{12}$/;

  if(id !== undefined && (typeof id !== 'string' || !userIDPattern.test(id))){
    //if id of type string is coming it'll be via the anonymous validation
    return res.status(NOT_ACCEPTABLE).json({
      message: 'Invalid login Id.'
    });
  }else{
    // if id is not there or the id is valid move ahead
    next();
  }
}

module.exports = {
  emailValidator,
  generateObjectId,
  validateUserID,
};
