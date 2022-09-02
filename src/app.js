const express = require("express");

//require("dotenv").config();
//const connect = require("./db/connectDB");
const routes = require("./routes/v1/index");
const cors = require("cors");
const errorHandler = require("./core/errorHandler");
const { NotFoundError } = require("./core/apiError");

const port = process.env.PORT || 3000;


const app = express();
app.use(cors());
app.use(express.json())
app.use("/v1", routes);
app.all("*", (req, res, next) => next(new NotFoundError()));
app.use(errorHandler);



app.listen(port, () => {
  console.log(`app run on port ${port}`);
});

process.on('uncaughtException', (e) => {
  console.log(e);
});
module.exports = app;


