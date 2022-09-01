const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
      trim: true,
    },
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
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre(/^find/, function (next) {
  this.find({ verified: { $ne: false } });
  next();
});

// UserSchema.pre("save", function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = bcrypt.genSaltSync(10);
//   const hash = bcrypt.hashSync(this.password, salt);
//   this.password = hash;
//   next();
// });

const User = mongoose.model("User", UserSchema);

module.exports = User;
