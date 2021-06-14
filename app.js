require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const port = process.env.PORT || 3001;

//API security
app.use(helmet());

//handle CORS error
app.use(cors());

//MongoDB connection setup
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

if (process.env.NODE_ENV != "production") {
  const mongoDB = mongoose.connection;

  mongoDB.on("open", () => {
    console.log("MongoDB is connected");
  });
  mongoDB.on("error", (error) => {
    console.log(error);
  });

  //logger
  app.use(morgan("dev"));
}

//set body-parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//load routers
const userRouter = require("./src/routers/user.router");
const ticketRouter = require("./src/routers/ticket.router");
const tokensRouter = require("./src/routers/tokens.router");

//Use Routers
app.use("/v1/user", userRouter);
app.use("/v1/ticket", ticketRouter);
app.use("/v1/tokens", tokensRouter);

//ErrorHandler
const handleError = require("./src/utils/errorHandler");

app.use((req, res, next) => {
  const error = new Error("Resources not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  handleError(error, res);
});

//Listening to the port
app.listen(port, () => {
  console.log(`API is ready on http://localhost:${port}`);
});
