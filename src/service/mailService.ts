import nodemailer from 'nodemailer';

const sendMail = async (subject: string, toEmail: string, otpText: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PW,
    },
  });

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: toEmail,
    subject,
    text: otpText,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw new Error(error as unknown as string);
    } else {
      console.log('email sent');
      return true;
    }
  });
};

export default sendMail;
