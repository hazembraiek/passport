import { ObjectId, FilterQuery } from "mongoose";
import { hashString } from "../../auth/authutil";
import KeyStore, { KeyStoreModel } from "../models/KeyStore";

const createVerification = async (
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

const getVerification = async (
  userId: ObjectId
): Promise<KeyStore[] | null> => {
  return await KeyStoreModel.find({
    client: userId,
  });
};

const deleteExpiresCodes = async (userId: ObjectId) => {
  return await KeyStoreModel.deleteMany({
    client: userId,
  });
};

const create = async(data:KeyStore) : Promise<KeyStore | null> => {
  return await KeyStoreModel.create(data)
}

const findOne = async (query : FilterQuery<KeyStore>):Promise<KeyStore | null> =>  {
  return await KeyStoreModel.findOne(query);
}


const keyStoreRepository = {
  createVerification,
  getVerification,
  deleteExpiresCodes,
  create,
  findOne
};

export default keyStoreRepository;
