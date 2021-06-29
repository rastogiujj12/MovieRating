const {
  STATUS_CODE: { UNAUTHORIZED },
} = require("../constants");

const UserModel = require("../db/model/user");

module.exports = {
  loginValidate: async function (req, res, next) {
    //TODO
    next();
  },
};
