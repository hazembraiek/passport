import nodemailer from "nodemailer";

interface emailBaseOption {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

export interface mailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string
}

function createSendMail(options: emailBaseOption) {
  //create transporter
  let transporter = nodemailer.createTransport(options);
  return async function (mailOptions: mailOptions) {
    return await transporter.sendMail(
      {
        from: process.env.MAILFROM || "mansourirayen@takiacademyteam.com",
        ...mailOptions,
      },
      () => {}
    );
  };
}

/*modify it to your service*/
export default createSendMail({
  host: "in-v3.mailjet.com",
  port: 587,
  auth: {
    user: "8a37e8f03dabdc5b56fbb31b65c20cc3",
    pass: "f4364af6ddd1968941e4ee7ea4743851",
  },
});
