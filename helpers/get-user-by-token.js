const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUserByToken = async (token) => {
  //validations
  if(!token){
    return res.status(401).json({message: "Acesso Negado"})
  }

  const decoded = jwt.verify(token, "meuscret:qwerpoiugh");

  const userId = decoded.id;

  const user = await User.findById(userId);

  return user;
};

module.exports = getUserByToken;
