import { model, Schema, Document, ObjectId } from "mongoose";

export default interface KeyStore extends Document {
  client: ObjectId;
  key: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KeyStoreSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
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

export const KeyStoreModel = model<KeyStore>("KeyStore", KeyStoreSchema);
