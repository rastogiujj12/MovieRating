const express = require("express");
const router = express.Router();
require('express-group-routes');

//middlewares
const authMiddleware = require("../middleware/auth");

//controllers
const userController = require("../controller/user");
const moviesController = require("../controller/movie")

//api routes
router.group("/api", (app) => {
  app.post("/login", userController.login);
  app.post("/signup", userController.signup);
  
  app.get('/autologin', authMiddleware.loginValidate, userController.autoLogin)

  app.get("/movie/get",    moviesController.getMovies);
  app.get("/movie/search", moviesController.searchMovie);
  
  app.put("/movie/addMultiple", 
    authMiddleware.loginValidate,
    moviesController.addMultipleMovies
  );
  app.put("/movie/addSingle", 
    authMiddleware.loginValidate,
    moviesController.addSingleMovie
  );

  app.post("/movie/edit",
    authMiddleware.loginValidate,
    moviesController.editMovie
  );

  app.delete("/movie/delete",
    authMiddleware.loginValidate,
    moviesController.deleteMovie
  );

  app.get("/genre/get", moviesController.getGenre);
  app.get("/director/get", moviesController.getDirectors)

  app.use('*', function(req, res){
    res.status(404);
    res.send({ error: "URL Not found" });
  });
  
});

module.exports = router;
