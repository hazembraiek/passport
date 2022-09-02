<<<<<<< HEAD:src/app.js
const express = require("express");

//require("dotenv").config();
//const connect = require("./db/connectDB");
=======
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
require("./db/connectDB");
>>>>>>> 4e6df3dff59a099ca91322aef9912e05b8e3ee07:dist/app.js
const routes = require("./routes/v1/index");
const cors = require("cors");
const errorHandler = require("./core/errorHandler");
const { NotFoundError } = require("./core/apiError");
<<<<<<< HEAD:src/app.js

const port = process.env.PORT || 3000;


const app = express();
app.use(cors());
app.use(express.json())
app.use("/v1", routes);
app.all("*", (req, res, next) => next(new NotFoundError()));
app.use(errorHandler);



=======
const { swaggerDocs } = require("./utils/swagger");
const port = process.env.PORT || 3000;
swaggerDocs(app);
app.use(cors());
app.use(express_1.default.json());
app.use("/v1", routes);
app.all("*", (req, res, next) => next(new NotFoundError()));
app.use(errorHandler);
>>>>>>> 4e6df3dff59a099ca91322aef9912e05b8e3ee07:dist/app.js
app.listen(port, () => {
    console.log(`app run on port ${port}`);
});

process.on('uncaughtException', (e) => {
  console.log(e);
});
module.exports = app;


