const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  name:         { type: String, required:true, unique: true, uniqueCaseInsensitive: true },
  imdbScore:    { type: String, required:true },
  popularity99: { type: String, required:true },
  director:     { 
    type: Schema.Types.ObjectId, 
    ref: "Director", 
    required:true, 
  },
  genre:        [{ 
    type: Schema.Types.ObjectId, 
    ref: "Genre", 
    required:true, 
  }],
  createdBy:{
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required:true,
  },
  modifiedBy:{
    type: Schema.Types.ObjectId, 
    ref: "User" 
  }
});

movieSchema.plugin(uniqueValidator, { message: "Fields must be unique." });

let Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
