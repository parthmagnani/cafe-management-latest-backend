require('dotenv').config()
const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    

    if(authHeader == null){
        return res.sendStatus(401)
    }

    jwt.verify(authHeader, process.env.ACCESS_TOKEN, (err, results) => {
        if(err)
        return res.sendStatus(403)
        
        res.locals = results
        next()
    })
}

module.exports = {authenticateToken: authenticateToken}