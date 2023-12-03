const express = require('express')

const connection = require('../connection')
const auth = require('../services/authentication')

let ejs = require('ejs')
let pdf = require('html-pdf')
let fs = require('fs')
let uuid = require('uuid')
let path = require('path')

const router = express.Router()

// generate bill
router.post('/generateReport', auth.authenticateToken, (req, res) => {

    const generatedUuid = uuid.v1()
    const orderDetails = req.body
    let productDetailsReport = JSON.stringify(orderDetails.productDetails)
    let query = "insert into bill (name, uuid, email, contactNumber, paymentMethod, total ,productDetails, createdBy) values (?,?,?,?,?,?,?,?)"

    connection.query(query, [orderDetails.name, generatedUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.total, productDetailsReport, res.locals.email], (err, results) => {

        if(!err){

            ejs.renderFile(path.join(__dirname, '', "report.ejs"), { productDetails: JSON.parse(productDetailsReport),name:orderDetails.name, email:orderDetails.email, contactNumber:orderDetails.contactNumber, paymentMethod:orderDetails.paymentMethod, total:orderDetails.total }, (err, results) => {

                if(err){
                    return res.status(500).json(err)
                }else{

                    pdf.create(results).toFile('./generated_pdf/' + generatedUuid + '.pdf', function(error, fileRes){
                        if(err){
                            return res.status(500).json(err)
                        }else{
                            
                            return res.status(200).json({status:200, message:"Order placed successfully", data: [{uuid:generatedUuid }] })
                        }
                    })
                }
            })

        }else{
            
            return res.status(500).json(err)
        }
    })

})

// to get pdf
router.post('/getpdf', auth.authenticateToken, (req, res) => {
    const orderDetails = req.body
    const pdfPath = './generated_pdf/' + orderDetails.uuid + '.pdf'

    if(fs.existsSync(pdfPath)){
        console.log("UUID already exist and you will get pdf directly")
        res.contentType("application/pdf")
        fs.createReadStream(pdfPath).pipe(res)
    }else{
        console.log("you are in else condition")
        let productDetailsReport = JSON.stringify(orderDetails.productDetails)

        ejs.renderFile(path.join(__dirname, '', "report.ejs"), { productDetails: JSON.parse(productDetailsReport),name:orderDetails.name, email:orderDetails.email, contactNumber:orderDetails.contactNumber, paymentMethod:orderDetails.paymentMethod, total:orderDetails.total }, (err, results) => {

            if(err){
                return res.status(500).json(err)
            }else{

                pdf.create(results).toFile('./generated_pdf/' + orderDetails.uuid + '.pdf', function(error, fileRes){
                    if(err){
                        return res.status(500).json(err)
                    }else{
                        res.contentType("application/pdf")
                        fs.createReadStream(pdfPath).pipe(res)
                    }
                })
            }
        })
    }
})


// get list of bills
router.get('/getBills', auth.authenticateToken, (req,res) => {
    let query = "select * from bill order by id DESC"
    connection.query(query, (err, results) => {
        if(!err){
            return res.status(200).json({status: 200, data: results})
        }else{
            return res.status(500).json(err)
        }
    })
})

// delete bill
router.post('/delete', auth.authenticateToken, (req, res) => {
    const bill = req.body

    let query = "delete from bill where id = ?"
    connection.query(query, [bill.id], (err, results) => {
        if(!err){
            if(results.affectedRows == 0){
                return res.status(401).json({status:401, message: "bill does not found"})
            }
            return res.status(200).json({message: "Bill deleted successfully"})
        }else{
            return res.status(500).json(err)
        }
    })
})

module.exports = router