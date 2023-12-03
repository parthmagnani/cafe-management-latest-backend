const express = require('express')

const connection = require('../connection')
const auth = require('../services/authentication')
const checkRole = require('../services/checkRole')

const router = express.Router()

// add category
router.post('/add', auth.authenticateToken, (req, res) => {
    let category = req.body

    query = "insert into category (name) values (?)"
    connection.query(query, [category.name], (err,results) => {
        if(!err){
            return res.status(200).json({status: 200, message: 'category added successfully! '})
        }else{
            return res.status(500).json(err)
        }
    })
})

// get Category
router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let query = "select * from category order by name";
    connection.query(query, (err, results) => {
        if(!err){
            return res.status(200).json({status: 200, data: results})
        }else{
            return res.status(500).json({message: err})
        }
    })
})

// to update name of category
router.post('/update', auth.authenticateToken,  (req, res) => {
    let category = req.body
    let query = "update category set name = ? where id = ?"

    connection.query(query, [category.name, category.id], (err, results) => {
        if(!err){

            if(results.affectedRows == 0){
                return res.status(404).json({message: 'category does not exist'})
            }

            return res.status(200).json({status: 200, message: "category update successfully"})
        }else{
            return res.status(500).json({message: err})
        }
    })
})

// to delete category
router.post('/delete',auth.authenticateToken, (req,res) => {
    let category = req.body
    let query = "delete from category where id = ?"
    connection.query(query, [category.id], (err, results) => {

        if(!err){
            if(results.affectedRows == 0){
                return res.status(401).json({status:401, message: "category does not found"})
            }
            return res.status(200).json({message: "Category deleted successfully", status: 200})
        }else{
            return res.status(500).json(err)
        }
    })
} )

module.exports = router