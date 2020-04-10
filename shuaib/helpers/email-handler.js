const nodemailer = require("nodemailer");

function sendMail(toSubject, toMesssage, toEmail) {
  let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "3ab837b5567ee0", // Username
      pass: "514999a856290a", // Password
    },
  });

  const message = {
    from: "shuaib97@gmail.com", // Sender address
    to: toEmail, // Receiver Email
    subject: toSubject, // Subject
    text: toMesssage, // Message
  };

  transport.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
}

module.exports = {
  sendMail,
};
