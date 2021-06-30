const mongoose = require("mongoose");

module.exports = () => {
  console.log("mongo", process.env.MONGODB_URL)
  return new Promise((resolve, reject) => {
    mongoose.connect(
      process.env.MONGODB_URL,
      { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
      (err) => {
        console.log(err);
        if (err) return reject(false);
        return resolve(true);
      }
    );
  });
};
