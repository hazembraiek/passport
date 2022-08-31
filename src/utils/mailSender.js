const nodemailer = require('nodemailer');

function createSendMail(options){
    //create transporter
    let transporter  = nodemailer.createTransport(options);
    return async function(mailOptions){
            return await transporter.sendMail({
            from:process.env.MAILFROM || "mansourirayen@takiacademyteam.com",
            ...mailOptions
        });
    }
}


/*modify it to your service*/
module.exports = createSendMail({
    host:"in-v3.mailjet.com",
    port: 587,
    auth: {
        user: "8a37e8f03dabdc5b56fbb31b65c20cc3", 
        pass: "f4364af6ddd1968941e4ee7ea4743851", 
    }
});
