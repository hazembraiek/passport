import { ObjectId } from "mongoose";
import { hashString } from "../../auth/authutil";
import KeyStore, { KeyStoreModel } from "../models/KeyStore";

export const createVerification = async (
  client: ObjectId,
  codeVerification: string
): Promise<KeyStore | null> => {
  const time = process.env.CODE_EXPIRES_IN || 360000;
  const expires = Date.now() + +time;
  const hashedCodeVerification = await hashString(codeVerification);
  return await KeyStoreModel.create({
    client,
    key: hashedCodeVerification,
    expires,
  });
};

export const getVerification = async (
  userId: ObjectId
): Promise<KeyStore[] | null> => {
  return await KeyStoreModel.find({
    client: userId,
  });
};

export const deleteExpiresCodes = async (userId: ObjectId) => {
  return await KeyStoreModel.deleteMany({
    client: userId,
  });
};

const keyStoreRepository = {
  createVerification,
  getVerification,
  deleteExpiresCodes,
};

export default keyStoreRepository;
