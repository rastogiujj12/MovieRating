const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const genreSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
});

genreSchema.plugin(uniqueValidator, { message: "Genre must be unique." });

let Genre = mongoose.model("Genre", genreSchema);
module.exports = Genre;
