const jwt =  require('jsonwebtoken')

//helpers
const getToken = require('./get-token')

//middleware validade token
const checkToken = (req, res, next) =>{
  if(!req.headers.authorization){
    return res.status(401).json({message: "Acesso Negado"})
  }
  const token = getToken(req)

  if(!token){
    return res.status(401).json({message: "Acesso Negado"})
  }

  try {
    const verified = jwt.verify(token, "meuscret:qwerpoiugh")
    req.user = verified
    next()
  } catch (err) {
    return res.status(400).json({message: "Token Invalido"})
  }
}

module.exports= checkToken