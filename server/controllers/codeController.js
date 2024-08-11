const CodeRouter = require('express').Router();
const {
  BAD_REQUEST,
  OK,
  INTERNAL_SERVER_ERROR,
} = require('../httpStatusCodes');
const { MailtrapClient } = require('mailtrap');
const { emailValidator } = require('../utils/helper');

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = 'https://send.api.mailtrap.io/';

const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });
const sender = {
  email: process.env.MAILTRAP_EMAIL,
  name: 'Whisper',
};

const sendCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(BAD_REQUEST)
      .json({ message: `Email or Code is missing` });
  }

  const recipients = [
    {
      email,
    },
  ];

  client
    .send({
      from: sender,
      to: recipients,
      subject: 'Your Whisper Verfication Code',
      text: code,
    })
    .then(() => {
      console.log('success');
      return res.status(OK).json({ message: `Code Sent To Email` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(INTERNAL_SERVER_ERROR).json({ error: err });
    });
};

CodeRouter.route('/').post(emailValidator, sendCode);

module.exports = CodeRouter;
