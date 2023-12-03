const express = require('express')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const connection = require('../connection')
const auth = require('../services/authentication')
const checkRole = require('../services/checkRole')

require('dotenv').config()

const router = express.Router()


// signup
router.post('/signup', (req, res) => {
    console.log("signup called")
    let user = req.body

    query = "select email from users where email = ?"
    connection.query(query, [user.email], (err,results) => {
        if(!err){
            if(results.length <= 0){
                query = "insert into users (name, contactNumber, email, password, status, role) values (?, ?, ?, ?, false, 'user')"

                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if(!err){
                        return res.status(200).json({status: 200, message: 'user registerd successfully! wait for admin approval'})
                    }else{
                        console.log("This is error", err)
                        return res.status(200).json({status: 500, message: 'There is something error try after sometime'})
                    }
                })
            }else{
                return res.status(200).json({status: 400, message: 'Email already exists'})
            }
        }else{
            return res.status(500).json({status: 500, message: err})
        }
    })
})

// login
router.post('/login', (req, res) => {
    console.log("This is request", req.body)
    const user = req.body
    query = "select * from users where email = ?"
    connection.query(query, [user.email], (err,results) => {
        if(!err){
            if(results.length <= 0 || results[0].password != user.password){
                return res.status(200).json({status: 401, message: 'Credentials are not correct!'})
            }else if(results[0].status == false){
                return res.status(200).json({status: 401, message:'Wait for admin approval'})
            }else if(results[0].password == user.password){
                const response = {id: results[0].id, email: results[0].email, role: results[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {expiresIn: '8h'})
                res.status(200).json({status: 200, message:'login successfully', data: accessToken})
            }else{
                res.status(200).json({message: 'something went wrong please try again later'})
            }
        }else{
            return res.status(500).json({status: 500, message: err})
        }
    })
})

// forgot password
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    service: 'gmail',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotPassword', (req, res) => {
    const user = req.body
    query = "select email, password from users where email =?"
    connection.query(query, [user.email], (err, results)=> {
        if(!err){
            if(results.length <= 0){
                return res.status(200).json({message: 'Password sent to your email successfully'})
            }else{
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Password by cafe management system',
                    html: ` <p>
                              <b>Your login details for cafe management system </b>
                              <br>
                              <b>Email:</b> ${results[0].email}
                              <br>
                              <b>Password:</b> ${results[0].password}
                            </p>`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if(error){
                        console.log("This is error while sending message", error)
                    }else{
                        console.log("-->>", info)
                        return res.status(200).json({message: 'Password sent to your email successfully'})
                    }
                })
            }
        }
    })
})


// users list for admin
router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let query = "select * from users where role = 'user'";
    connection.query(query, (err, results) => {
        if(!err){
            return res.status(200).json({status: 200, data: results})
        }else{
            return res.status(500).json({message: err})
        }
    })
})

// approve user to use cafe management by admin
router.post('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body
    let query = "update users set status = ? where id = ?"

    connection.query(query, [user.status, user.id], (err, results) => {
        if(!err){

            if(results.affectedRows == 0){
                return res.status(404).json({message: 'user id does not exist'})
            }

            return res.status(200).json({status: 200, message: "user update successfully"})
        }else{
            return res.status(500).json({message: err})
        }
    })
})

// api for change password
router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body
    const email = res.locals.email

    let query = "select * from users where email = ? and password = ?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if(!err){

            if(results.length <= 0){
                return res.status(400).json({message: "Incorrect Password"})
            }else if(results[0].password == user.oldPassword){
                query = "update users set password = ? where email = ?"
                connection.query(query, [user.newPassword, email], (err, response) => {
                    if(!err){
                        return res.status(200).json({status: 200, message: "Password updated successfully"})
                    }else{
                        res.status(500).json({status: 500, message: err})
                    }
                })
            }else{
                return res.status(400).json({status: 400, message: "something went wrong please try again later"})
            }
        }else{
            return res.status(500).json({Message: err})
        }
    })
})


module.exports = router
