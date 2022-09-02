import express, { Request, Response, NextFunction } from "express";
import "./db/connectDB";
import routes from "./routes/v1/index";
import cors from "cors";
import errorHandler from "./core/errorHandler";
import { NotFoundError } from "./core/apiError";
import { swaggerDocs } from "./utils/swagger";

const port = process.env.PORT || 3000;

const app = express();
swaggerDocs(app);

app.use(cors());
app.use(express.json());
app.use("/v1", routes);

app.all("*", (req: Request, res: Response, next: NextFunction) =>
  next(new NotFoundError())
);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`app run on port ${port}`);
});
