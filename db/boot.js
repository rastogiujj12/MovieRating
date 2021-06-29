const connect = require("./connect");
const fs = require("fs");

const configureDB = async () => {
  try {
    let connection = await connect();
    if (connection) console.log("DB connection done.");

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = {
  configureDB,
};
