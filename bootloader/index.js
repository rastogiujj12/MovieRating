const fs = require("fs");

const { secureGlobal } = require("../utils/miscllaneous");

const startBoot = () => {
  // services js
  console.log("__dirname", __dirname);
  let servicesList = fs.readdirSync(__dirname + "/../services"),
    services = new Object();

  servicesList.forEach((util) => {
    let package = require(`${__dirname}/../services/${util}`);
    services[package.name] = package.val;
  });
  secureGlobal("services", services);

  // initialise db
  const db = require("../db/boot").configureDB();
};

module.exports = startBoot;
