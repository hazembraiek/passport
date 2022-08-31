const userModel = require("./../models/userModel");

exports.createUser = async (user) => {
  return userModel.create(user);
};

exports.getUserByEmail = async (email) => {
  return userModel.findOne({ email });
};

exports.findById = async (id) => {
  return userModel.findById(id);
};

exports.activeUser = async (userId) => {
  return userModel.updateOne({ _id: userId }, { verified: true });
};

exports.findOne = async (query) => {
  return await userModel.findOne(query);
}

exports.create = async (data) => {
  return await userModel.create(data);
}
