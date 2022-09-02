import sendMail from "./mailSender";

const messageContainer = (option: string) =>
  `<p>you code is : ${option} , this code expires in 1 hour </p>
    <h2>Brayek hazem</h2>
    `;

const EmailTypes = {
  SIGNUP_SUBJECT: "code verification",
  LOGIN_SUBJECT: "password reset",
  SIGNUP_HTML: messageContainer,
  LOGIN_HTML: messageContainer,
};

export const sendEmail = async (
  to: string,
  type: string = "login",
  option: string
) => {
  const { subject, html } =
    type == "signup"
      ? {
          subject: EmailTypes.SIGNUP_SUBJECT,
          html: EmailTypes.SIGNUP_HTML(option),
        }
      : {
          subject: EmailTypes.LOGIN_SUBJECT,
          html: EmailTypes.LOGIN_HTML(option),
        };
  await sendMail({
    to,
    subject,
    html,
  });
};
