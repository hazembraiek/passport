"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("./db/connectDB");
const index_1 = __importDefault(require("./routes/v1/index"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = __importDefault(require("./core/errorHandler"));
const apiError_1 = require("./core/apiError");
const swagger_1 = require("./utils/swagger");
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
(0, swagger_1.swaggerDocs)(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/v1", index_1.default);
app.all("*", (req, res, next) => next(new apiError_1.NotFoundError()));
app.use(errorHandler_1.default);
app.listen(port, () => {
    console.log(`app run on port ${port}`);
});
