"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
require("./db/connectDB");
const routes = require("./routes/v1/index");
const cors = require("cors");
const errorHandler = require("./core/errorHandler");
const { NotFoundError } = require("./core/apiError");
const { swaggerDocs } = require("./utils/swagger");
const port = process.env.PORT || 3000;
swaggerDocs(app);
app.use(cors());
app.use(express_1.default.json());
app.use("/v1", routes);
app.all("*", (req, res, next) => next(new NotFoundError()));
app.use(errorHandler);
app.listen(port, () => {
    console.log(`app run on port ${port}`);
});
