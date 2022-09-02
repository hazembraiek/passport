import { Request } from "express";
import User from "./../db/models/userModel";

declare interface ProtectedRequest extends Request {
  user: User;
}
