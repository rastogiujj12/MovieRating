const Joi = require("@hapi/joi");
const Movie = require("../db/model/movie");
const Genre = require("../db/model/genre");
const Director = require("../db/model/director")

const { createResponse } = require("../utils/miscllaneous");

const totalPageSize = 20;


const getMovies = async (req, res, next) =>{
    let {filter, page} = req.query;
    let query={}
    if(filter) {
        let genre = await Genre.findOne({name:filter})
        // console.log("genre", genre);
        query = {"genre": { "$in" : [genre._id]} }
    }
    if(!page) page = 1;
    await Movie
    .find(query)
    .sort({'name': 1})
    .skip((page-1)*totalPageSize)
    .populate("genre director createdBy modifiedBy")
    .limit(totalPageSize)
    .exec(function(err, movies) {
        if(!err) res.send(createResponse("Fetch successful", movies, null))
        else next("Failed to fetch movies");
    });
};

const searchMovie = async (req, res, next) =>{
    let {search, page} = req.query;
    if(!page) page = 1;
    console.log("search", search)
    query={};
    if(search){
        let directorArray = await Director.find({"name": { $regex: search }}, "_id")
        directorArray = directorArray.map(obj=>obj.id);

        query = { $or: 
            [
                {"name": { $regex: search }},
                {"director": { "$in": directorArray}}
            ]
        }
    }
    await Movie
    .find(query)
    .sort({'name': 1})
    .skip((page-1)*totalPageSize)
    .populate("genre director createdBy modifiedBy")
    .limit(totalPageSize)
    .exec(function(err, movies) {
        if(!err) res.send(createResponse("Fetch successful", movies, null))
        else next("Failed to fetch movies");
    }); 
};

const addMultipleMovies = async (req, res, next) =>{
    const schema = Joi.object().keys({
        movies:Joi.array().items({
            name:Joi.string().required(),
            imdbScore:Joi.number().required(),
            popularity99:Joi.number().required(),
            director:Joi.string().required(),
            genre:Joi.array().items(Joi.string())
        })
    });
    const { error, value } = schema.validate(req.body)
    createMoviesFromArray(value.movies, req.user)
    // console.log("movies", value)
    if(error) next("Invalid data");    

    res.send(createResponse("movies created", null, null))

};

const createMoviesFromArray = async (movies, user) => {
    for(let movie of movies){
        // console.log("movie", movie.name, movie.director)
        let genreList = [];
        try{
            for(let elem of movie.genre){
                let temp = await Genre.findOne({name:elem})
                if(!temp) {
                    temp = await Genre.create({name:elem})
                }
                // console.log("genre", temp);
                genreList.push(temp.id);
            }
            let director = await Director.findOne({name:movie.director})
            if(!director) director = await Director.create({name:movie.director})

            Movie.create({
                name:movie.name,
                imdbScore:movie.imdbScore,
                popularity99: movie.popularity99,
                genre: genreList,
                director,
                createdBy:user.id
            }).catch(err => {}) //for dupilcate movies
        }
        catch(e){
            console.log("error", e);
        }
    }
}

const addSingleMovie = async (req, res, next) =>{
    const schema = Joi.object().keys({
        name:Joi.string().required(),
        imdbScore:Joi.number().required(),
        popularity99:Joi.number().required(),
        director:Joi.string().required(),
        genre:Joi.array().items(Joi.string())
    });
    const { error, value } = schema.validate(req.body)
    console.log("movie", value)
    if(error) next("Some error occured")

    Movie.create({
        name:value.name,
        imdbScore:value.imdbScore,
        popularity99: value.popularity99,
        genre: value.genre,
        director: value.director,
        createdBy: req.user.id
    }).catch(err => {}) //for dupilcate movies

    res.send(createResponse("movies created", null, null))
    
};

const editMovie = async (req, res, next) =>{
    const schema = Joi.object().keys({
        _id:Joi.string().required(),
        imdbScore:Joi.number(),
        popularity99:Joi.number(),
        director:Joi.string(),
        genre:Joi.array().items(Joi.string())
    });

    const { error, value } = schema.validate(req.body)

    if(error) next("Input Validation failed")
    try{
        await Movie.findOneAndUpdate({_id:value._id}, {...value, modifiedBy:req.user.id})    
    }
    catch(error){
        console.log("error", error)
        next("Some error occured")
    }

    res.send(createResponse("update successful", null, null))

};

const deleteMovie = async (req, res, next) =>{
    const schema = Joi.object().keys({
        _id:Joi.string().required()
    });

    const { error, value } = schema.validate(req.body)
    if(error) next("Input Validation failed")
    try{
        await Movie.findOneAndDelete({_id:value._id}, {...value, modifiedBy:req.user.id})    
    }catch(error){
        console.log("error", error)
        next("Some error occured")
    }
    res.send(createResponse("Delete successful", null, null))
};

module.exports = {
    getMovies,
    searchMovie,
    addMultipleMovies,
    addSingleMovie,
    editMovie,
    deleteMovie
  };
  