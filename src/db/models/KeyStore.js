const mongoose = require("mongoose");
const KeyStoreSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.ObjectId,
      required: [true, "client is required for store"],
      ref: "User",
    },
    key: {
      type: String,
      required: [true, "you must specify a key"],
    },
    expires: Date,
  },
  { timestamps: true }
);

KeyStoreSchema.pre(/^find/, function (next) {
  this.populate({
    path: "client",
  });
  next();
});

module.exports = mongoose.model("KeyStore", KeyStoreSchema);
