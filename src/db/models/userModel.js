const mongoose = require("mongoose");
// const validator = require("validator");
// const bcrypt = require("bcryptjs");
// const crypto = require("crypto");
// const { parse } = require("path/posix");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    default: "user",
    enum: ["admin", "user", "guide", "leade-guide"],
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: 8,
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
const User = mongoose.model("User", UserSchema);

module.exports = User;
