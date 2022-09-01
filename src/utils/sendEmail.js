const sendMail = require("./mailSender");

const messageContainer = (option) =>
  `<p>you code is : ${option} , this code expires in 1 hour </p>
    <h2>Brayek hazem</h2>
    `;

const Types = {
  SIGNUP_SUBJECT: "code verification",
  LOGIN_SUBJECT: "password reset",
  SIGNUP_HTML: messageContainer,
  LOGIN_HTML: messageContainer,
};

exports.sendEmail = async (to, type = "login", option) => {
  const { subject, html } =
    type == "signup"
      ? { subject: Types.SIGNUP_SUBJECT, html: Types.SIGNUP_HTML(option) }
      : { subject: Types.LOGIN_SUBJECT, html: Types.LOGIN_HTML(option) };
  await sendMail({
    to,
    subject,
    html,
  });
};
