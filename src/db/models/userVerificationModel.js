const mongoose = require("mongoose");

const UserVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: [true, "A user must have a name"],
      ref: "User",
    },
    codeVerification: {
      type: String,
      required: [true, "A code must be provided"],
    },
    expiresAt: {
      type: Date,
      required: [true, "you must provide when this code expires"],
    },
  },
  {
    timestamps: true,
  }
);

UserVerificationSchema.pre(/^find/, function (next) {
  this.find({ expiresAt: { $gt: Date.now() } });
  next();
});

const UserVerification = mongoose.model(
  "UserVerification",
  UserVerificationSchema
);

module.exports = UserVerification;
