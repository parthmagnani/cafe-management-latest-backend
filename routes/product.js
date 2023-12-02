const express = require('express')

const connection = require('../connection')
const auth = require('../services/authentication')
const checkRole = require('../services/checkRole')

const router = express.Router()

// add product
router.post("/add", auth.authenticateToken, (req, res) => {
  let product = req.body;

  query =
    "insert into product (name, categoryId, description,price, status ) values (?, ?, ?, ?, true )";
  connection.query(
    query,
    [product.name, product.categoryId,product.description, product.price, product.status],
    (err, results) => {
      if (!err) {
        return res
          .status(200)
          .json({ status: 200, message: "product added successfully! " });
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

// get product
router.get("/get", auth.authenticateToken, (req, res) => {
  let query = `select p.id, p.name, p.description, p.price, p.status, c.id as categoryId, c.name as categoryName 
               from product as p 
               INNER JOIN category as c 
               where p.categoryId = c.id`;
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json({ status: 200, data: results });
    } else {
      return res.status(500).json({ message: err });
    }
  });
});

// api for list of product on basis of category
router.post("/getByCategory", auth.authenticateToken, (req, res) => {
  const categoryId = req.body.categoryId;
  let query = `select * from product where categoryId = ? and status = true`;
  connection.query(query, [categoryId], (err, results) => {
    if (!err) {
      if(results.length <= 0){
        return res.status(400).json({ status: 400, message: "Please add product for this category" });
      }
      return res.status(200).json({ status: 200, data: results });
    } else {
      return res.status(500).json({ message: err });
    }
  });
});

// api for product on basis of product id
router.post("/getById", auth.authenticateToken, (req, res) => {
  const id = req.body.productId;
  let query = `select * from product where id = ? and status = true`;
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if(results.length <= 0){
        return res.status(400).json({ status: 400, message: "No product found" });
      }
      return res.status(200).json({ status: 200, data: results });
    } else {
      return res.status(500).json({ message: err });
    }
  });
});

// to update name of product
router.patch('/update', auth.authenticateToken,  (req, res) => {
    let product = req.body
    let query = "update product set name = ?, categoryId = ?, description = ?, price = ?  where id = ?"

    connection.query(query, [product.name, product.categoryId, product.description, product.price, product.id], (err, results) => {
        if(!err){

            if(results.affectedRows == 0){
                return res.status(404).json({message: 'product does not exist'})
            }

            return res.status(200).json({status: 200, message: "product update successfully"})
        }else{
            return res.status(500).json({message: err})
        }
    })
})

// to delete product
router.post('/delete', auth.authenticateToken, (req, res) => {
    const product = req.body
    let query = "delete from product where id = ?"
    connection.query(query, [product.id], (err, results) => {
        if(!err){
            if(results.affectedRows == 0){
                return res.status(401).json({status:401, message: "product does not found"})
            }

            return res.status(200).json({status: 200, message: "product deleted successfully"})
        }else{
            return res.send(500).json(err)
        }
    })
})

// to change status
router.patch('/updateStatus', auth.authenticateToken,  (req, res) => {
    let product = req.body
    let query = "update product set status = ? where id = ?"

    connection.query(query, [product.status, product.id], (err, results) => {
        if(!err){

            if(results.affectedRows == 0){
                return res.status(404).json({message: 'product does not exist'})
            }

            return res.status(200).json({status: 200, message: "product status update successfully"})
        }else{
            return res.status(500).json({message: err})
        }
    })
})

module.exports = router