const {
  STATUS_CODE: { UNAUTHORIZED },
} = require("../constants");
const jwt = require("jsonwebtoken");
const User = require("../db/model/user");

module.exports = {
  loginValidate: async function (req, res, next) {
    const token = req.header("Authorization");

    // console.log('header', req.header("Authorization"));
    if (!token) next({ message: "Invalid User", status: UNAUTHORIZED });
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
        // console.log("decoded", decoded);
        if(err){
          console.log('err', err)
          next({ message: "Invalid User", status: UNAUTHORIZED });
        }

        let user = await User.findOne({_id:decoded.user.id});
        if(!user) next({ message: "Invalid User", status: UNAUTHORIZED });
        
        req.user = decoded.user;
        next();	
      });
    } catch (e) {
      console.error(e);
      res.json({
      error:"Token expired"
      })
    }
  },
};
