const { KeyStoreModel } = require("../models");

exports.findOne = async (query) => {
    return await KeyStoreModel.findOne(query);
}

exports.create = async (data) => {
    return await KeyStoreModel.create(data);
}