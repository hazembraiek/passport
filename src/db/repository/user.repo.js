const { UserModel } = require("../models");

exports.findOne = async (query) => {
    return await UserModel.findOne(query);
}

exports.create = async (data) => {
    return await UserModel.create(data);
}