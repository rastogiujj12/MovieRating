const Joi = require("@hapi/joi");
const User = require("../db/model/user");
const { createResponse } = require("../utils/miscllaneous");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const saltRounds = 10;

const login = async (req, res, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    next("Invalid data");
  }

  try {
		let user = await User.findOne({
			email:value.email
		});

    if (!user) next("Invalid user email or password");
    if(!bcrypt.compareSync(value.password, user.password)) 
      next("Invalid user email or password");
    
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: 360000
      },
      (err, token) => {
        if (err) throw err;
        // console.log('token', token)
        res.send(createResponse("Login successful", {token}, null))
      }
    );
			
	} catch (e) {
		console.log('login error', e);
		next("Some error occured")
	} 
};

const signup = async (req, res, next) =>{

  const schema = Joi.object().keys({
    name: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    next("Invalid data");
  }
	

	try {
		let user = await User.findOne({
			email:value.email
		});
		if (user) {
      next("Email already exists");
		}

    user = new User({
			name:value.name,
			email:value.email,
			password:bcrypt.hashSync(value.password, saltRounds)
		});

		await user.save();

		const payload = {
			user: {
				id: user.id
			}
		};

		jwt.sign(
			payload,
			process.env.JWT_SECRET, {
				expiresIn: 36000
			},
			(err, token) => {
				if (err) throw err;
				// res.cookie('xsrf-token', token, {maxAge: 900000, httpOnly: true});
        res.send(createResponse("Signup successful", user, null))
			}
		);
	} catch (err) {
		console.log(err);
		next("Some error occured")
	} 
}

module.exports = {
  login,
  signup
};
