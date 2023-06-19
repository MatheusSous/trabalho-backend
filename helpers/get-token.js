const getToken = (req) => {
  const authToken = req.headers.authorization

  const token = authToken.split(" ")[1]
  return token
}

module.exports = getToken