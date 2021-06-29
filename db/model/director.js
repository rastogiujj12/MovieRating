const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const directorSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
});

directorSchema.plugin(uniqueValidator, { message: "Director name must be unique." });

let Director = mongoose.model("Director", directorSchema);
module.exports = Director;
