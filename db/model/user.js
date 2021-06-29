const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  Name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator, { message: "Email must be unique." });

let User = mongoose.model("User", userSchema);
module.exports = User;
