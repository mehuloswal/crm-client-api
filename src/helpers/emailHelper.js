const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "justina.walter70@ethereal.email",
    pass: "7ac1Jm61sduVvaNNYT",
  },
});
const send = (info) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result = await transporter.sendMail(info);

      console.log("Message sent: %s", result.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(result));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      resolve(result);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const emailProcessor = (email, pin) => {
  const info = {
    from: '"CRM by Mehul Oswal" <justina.walter70@ethereal.email>', // sender address
    to: email, // list of receivers
    subject: "Password Reset Pin", // Subject line
    text:
      "Here is your password reset Pin" + pin + "This pin will expire in 1day", // plain text body
    html: `<b>Hello</b>
    Here is your pin: 
    <b>${pin}</b>
    This pin will expire in 1day`, // html body
  };
  send(info);
};

module.exports = {
  emailProcessor,
};
