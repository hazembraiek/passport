import { ObjectId } from "mongoose";
import User, { UserModel } from "./../models/userModel";

const createUser = async (user: User): Promise<User | null> => {
  return UserModel.create(user);
};

const getUserByEmail = async (email: String): Promise<User | null> => {
  return UserModel.findOne({ email: email.toString() });
};

const findById = async (id: ObjectId): Promise<User | null> => {
  return UserModel.findById(id);
};

const activeUser = async (userId: ObjectId) => {
  return UserModel.updateOne({ _id: userId }, { verified: true });
};

const userRepository = { createUser, getUserByEmail, findById, activeUser };

export default userRepository;
