import { model, Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export default interface User extends Document {
  find: any;
  name: string;
  email: string;
  password: string;
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema(
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

UserSchema.pre<User>(/^find/, function (next): void {
  this.find({ verified: { $ne: false } });
  next();
});

export const UserModel = model<User>("User", UserSchema);
