const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (option) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'PhuKun <phukun0404@gmail.com> ',
    to: option.email,
    subject: option.subject,
    text: option.message,
    // html: '<h1>HTML version</h1>',
  };
  // 3) Send the email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
