"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
};
const dbURL = process.env.MONGODB_URL;
mongoose_1.default
    .connect(dbURL, options)
    .then(() => console.log(`DB connected (new start) to: : ${process.env.MONGODB_URL}`))
    .catch((err) => {
    console.log("DB connection error");
});
mongoose_1.default.connection.on("connected", () => {
    console.log("Mongoose default connection open to " + dbURL);
});
mongoose_1.default.connection.on("error", (err) => {
    console.log("Mongoose default connection error: " + err);
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log("Mongoose default connection disconnected");
});
