const express = require("express");
const app = express();
//require("dotenv").config();
require("./db/connectDB");
const routes = require("./routes/v1/index");
const cors = require("cors");
const errorHandler = require("./core/errorHandler");
const { NotFoundError } = require("./core/apiError");
const { swaggerDocs } = require("./utils/swagger");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;

swaggerDocs(app);

app.use(cors());
app.use(express.json());
app.use("/v1", routes);

app.all("*", (req, res, next) => next(new NotFoundError()));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`app run on port ${port}`);
});
