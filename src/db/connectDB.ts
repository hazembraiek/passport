import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

const dbURL = process.env.MONGODB_URL;

mongoose
  .connect(dbURL, options)
  .then(() =>
    console.log(`DB connected (new start) to: : ${process.env.MONGODB_URL}`)
  )
  .catch((err) => {
    console.log("DB connection error");
  });

mongoose.connection.on("connected", () => {
  console.log("Mongoose default connection open to " + dbURL);
});

mongoose.connection.on("error", (err: any) => {
  console.log("Mongoose default connection error: " + err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose default connection disconnected");
});
