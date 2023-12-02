require('dotenv').config()
const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next){
    console.log("to check header in authentication", req.headers)
    const authHeader = req.headers['authorization']
    // console.log("This is authHeader",authHeader )
    // const token = authHeader && authHeader.split(' ')[1]
    // console.log("This is token", token)

    if(authHeader == null){
        return res.sendStatus(401)
    }

    jwt.verify(authHeader, process.env.ACCESS_TOKEN, (err, results) => {
        if(err)
        return res.sendStatus(403)
        
        res.locals = results
        console.log("res.locals in authenticate funtion", res.locals)
        next()
    })
}

module.exports = {authenticateToken: authenticateToken}