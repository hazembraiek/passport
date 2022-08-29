const mongoose = require("mongoose");
// const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const { parse } = require("path/posix");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
  },
});

// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 12);

//   this.conformPassword = undefined;
// });

// UserSchema.methods.corectpassword = async function (
//   CondidatPassword,
//   UserPassword
// ) {
//   return await bcrypt.compare(CondidatPassword, UserPassword);
// };

// // UserSchema.methods.changePasswordVRF = (TimeTK) => {
// //   TimeTK = parseInt(TimeTK.getTime() / 1000, 10);
// //   return TimeTK > changePWdAt;
// // };

// UserSchema.methods.creatPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString("hex");

//   this.passwordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   console.log({ resetToken }, this.passwordResetToken);
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
//   return resetToken;
// };
/**
 * A function to campare the encrypted password
 */

UserSchema.pre("save", function(next){
  if(!this.isModified("password")) return next();
  const salt =  bcrypt.genSaltSync(10);
  const hash =  bcrypt.hashSync(this.password,salt);
  this.password = hash;
  next();
})

UserSchema.methods.generateJWT = (expiresIn) => {
  const payload = {
    id:this._id,
    email:this.email
  }
  return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn});
}

 UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
