const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const { KeyStoreModel } = require("../../../src/db/models");
const UserModel = require("../../../src/db/models/userModel");

const salt = bcrypt.genSaltSync(10);
const USER_PASSWORD = "pass1";
const USER = {
        email:"john@example.domain",
        password:USER_PASSWORD,
        _id:mongoose.Types.ObjectId()
}

const keystoreDB = [];


const FakeUserModel = (obj) => {
    let ret = {...obj}
    ret._doc = obj;
    ret.save = () => {
        
    }
    return ret
}
const FakeKeyStoreModel = (obj) => {
    let ret = {...obj}
    ret._doc = obj;
    ret.delete = () => {
        keystoreDB.length = 0
    }
    return ret
}

const getVal = (value) => {
    if(typeof value === "string")
        return value;
    else if(value._id !== undefined)
        return value._id;
    
    throw new Error("mocking error");
}

const mockFindOne = jest.fn(async (query) => {
    if(query.email && USER.email === getVal(query.email))
        return FakeUserModel({...USER,password:bcrypt.hashSync(USER_PASSWORD,salt)})
    if(query._id &&  USER._id === getVal(query._id))
        return FakeUserModel({...USER,password:bcrypt.hashSync(USER_PASSWORD,salt)})
    return null;
})

const mockKeystoreCreate = jest.fn(async (data) =>{
     
     keystoreDB.push(FakeKeyStoreModel(data))
});



const mockKeystoreFindOne = jest.fn(async (query) => {
  
    const existingKey = keystoreDB.find(doc => 
        Object.entries(query).every(([key,value]) => doc[key] === getVal(value))
    );
    if(existingKey && existingKey.client === USER._id){ //simulate populate
            existingKey._doc.client = FakeUserModel({...USER,password:bcrypt.hashSync(USER_PASSWORD,salt)});
            existingKey.client = FakeUserModel({...USER,password:bcrypt.hashSync(USER_PASSWORD,salt)});
    }
    return existingKey   
})


jest.mock("../../../src/db/repository/userRepo",() => ({
    get findOne(){
        return mockFindOne
    }
}));


jest.mock("../../../src/db/repository/keyStore.repo",() => ({
    get create(){
        return mockKeystoreCreate
    },
    get findOne(){
        return mockKeystoreFindOne
    }
}));


jest.mock("../../../src/utils/mailSender.js",() => {
    return jest.fn((mailOptions) => global.RESET_LINK = mailOptions.text.split("/").pop());
});


module.exports = {
    existingUser:USER
}


