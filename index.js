const express = require('express')
const cors = require('cors')

const app = express()

//Config JSON Response
app.use(express.json())

//Solve Cors
app.use(cors({credentials: true, origin: 'http://localhost:3000'}))

//Public folder for images
app.use(express.static('public'))

//Routes
const UserRoutes = require('./routes/UserRoutes')
app.use('/users', UserRoutes)
const PetRouter = require('./routes/PetRouter')
app.use('/pets', PetRouter)


app.listen(5000)