const Joi = require("@hapi/joi");
const Movie = require("../db/model/movie");
const Genre = require("../db/model/genre");
const Director = require("../db/model/director")

const { createResponse } = require("../utils/miscllaneous");
const { create } = require("../db/model/movie");

const totalPageSize = 10;


const getMovies = async (req, res, next) =>{
    let {filter, page} = req.query;
    let query={}
    if(filter) {
        let genre = await Genre.findOne({name:filter})
        // console.log("genre", genre);
        query = {"genre": { "$in" : [genre._id]} }
    }
    if(!page) page = 1;
    let movieCount = await Movie.find(query).count();
    await Movie
    .find(query)
    .sort({'name': 1})
    .skip((page-1)*totalPageSize)
    .populate("genre director createdBy modifiedBy")
    .limit(totalPageSize)
    .exec(function(err, movies) {
        if(!err) res.send(createResponse("Fetch successful", {movies, count:movieCount}, null))
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
            name:Joi.string().required().trim(),
            imdbScore:Joi.number().required(),
            popularity99:Joi.number().required(),
            director:Joi.string().required().trim(),
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
        name:Joi.string().required().trim(),
        imdbScore:Joi.number().required(),
        popularity99:Joi.number().required(),
        director:Joi.object().required(),
        genre:Joi.array().items()
    });
    const { error, value } = schema.validate(req.body)
    if(error) next("Some error occured")

    if(!value.director._id){
        //create new director
        let temp = await Director.findOne({name:value.director.name})
        if(!temp) temp =  await Director.create({name:value.director.name})
        value.director = temp;
    }
    let genreList = [];
    for(let elem of value.genre){
        if(!elem._id){
            //create new genre
            let temp = await Genre.findOne({name:elem})
            if(!temp) temp = await Genre.create({name:elem})
            genreList.push(temp._id.toString())
        }
        else genreList.push(elem._id);
    }

    Movie.create({
        name:value.name,
        imdbScore:value.imdbScore,
        popularity99: value.popularity99,
        genre: genreList,
        director: value.director._id,
        createdBy: req.user.id
    }).catch(err => {}) //for dupilcate movies

    res.send(createResponse("movie created", null, null))
};

const editMovie = async (req, res, next) =>{
    const schema = Joi.object().keys({
        _id:Joi.string().required().trim(),
        name:Joi.string().required().trim(),
        imdbScore:Joi.number().required(),
        popularity99:Joi.number().required(),
        director:Joi.object().required(),
        genre:Joi.array().items()
    });

    const { error, value } = schema.validate(req.body)
    if(error) console.log("error", error)

    if(!value.director._id){
        //create new director
        let temp = await Director.findOne({name:value.director.name})
        if(!temp) temp =  await Director.create({name:value.director.name})
        value.director = temp;
    }
    let genreList = [];
    for(let elem of value.genre){
        if(!elem._id){
            //create new genre
            let temp = await Genre.findOne({name:elem})
            if(!temp) temp = await Genre.create({name:elem})
            genreList.push(temp._id.toString())
        }
        else genreList.push(elem._id);
    }

    console.log("new movie", {
        _id: value._id,
        name:value.name,
        imdbScore:value.imdbScore,
        popularity99: value.popularity99,
        genre: genreList,
        director: value.director,
        modifiedBy:req.user.id
    })

    try{
        let movie = await Movie.updateOne({_id:value._id}, { $set: {
            name:value.name,
            imdbScore:value.imdbScore,
            popularity99: value.popularity99,
            genre: genreList,
            director: value.director._id,
            modifiedBy:req.user.id
        }})    
        console.log("updated movie", movie)
    }
    catch(error){
        console.log("error", error)
        next("Some error occured")
    }

    res.send(createResponse("update successful", null, null))

};

const deleteMovie = async (req, res, next) => {
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

const getGenre = async (req, res, next) => {
    let genre = await Genre.find({}).sort({'name':1});

    if(!genre) next("Some error occured")
    res.send(createResponse("genre found", genre, null));
}

const getDirectors = async (req, res, next) => {
    let directors = await Director.find({}).sort({'name':1});

    if(!directors) next("Some error occured")
    res.send(createResponse("Directors found", directors, null));
}

module.exports = {
    getMovies,
    searchMovie,
    addMultipleMovies,
    addSingleMovie,
    editMovie,
    deleteMovie,
    getGenre,
    getDirectors
  };
  