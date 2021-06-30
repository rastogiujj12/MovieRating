const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

//response fn
const { createResponse } = require("./utils/miscllaneous");
const {
  STATUS_CODE: { ERROR },
} = require("./constants");


// API documentation
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public/")));

require("dotenv").config();
require("./bootloader/index")();

const indexRouter = require("./routes/index");
app.use("/", indexRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use("*", function (req, res, next) {
  res.status(404);
  res.send({ error: "URL Not found" });
});

// error handler
app.use(function (err, req, res, next) {
  console.log(">>",err);
  res.status(err.status || ERROR);
  res.send(err.message || err, null, true);
});

const port = process.env.PORT || "3000";
app.listen(port, () => {
  //TODO add url also from config
  console.log(`Server listening on ${port}`);
});
