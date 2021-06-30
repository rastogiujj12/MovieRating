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
  
  app.get("/getMovies",   moviesController.getMovies);
  app.get("/searchMovie", moviesController.searchMovie);
  
  app.put("/addMultipleMovies", 
    authMiddleware.loginValidate,
    moviesController.addMultipleMovies
  );
  app.put("/addSingleMovie", 
    authMiddleware.loginValidate,
    moviesController.addSingleMovie
  );

  app.post("/editMovie",
    authMiddleware.loginValidate,
    moviesController.editMovie
  );

  app.delete("/deleteMovie",
    authMiddleware.loginValidate,
    moviesController.deleteMovie
  );

  app.use('*', function(req, res){
    res.status(404);
    res.send({ error: "URL Not found" });
  });
  
});

module.exports = router;
