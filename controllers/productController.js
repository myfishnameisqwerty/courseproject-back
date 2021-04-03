const Products = require("../models/productModel")
const limit_ = 10;
const calcHash = require('object-hash');
const { log } = require("debug");

exports.store = async (req, res) => {
    try{
        let newProduct = {...req.body}
        newProduct = {...newProduct, hash: calcHash(newProduct)}
        Products.findOne({hash:newProduct.hash}, (err, result) => {
            console.log(err);
            if (!result)
                Products.create(newProduct , (err) => {
                    if (err) return (res.json({errorStatus: true, error: err}))
                    else return (res.json({errorStatus: false}))
                })
            else    return (res.json({errorStatus: true, message: "This product is allready exists"}))
        })
        
    }
    catch (err){
        console.log('here2');
        res.status(500).json({errorStatus: true, error: err})
    }
}

exports.getProduct = async (req, res) => {
    Products.findById(req.params.id, (err, result) => {
        if (err)
            return (res.json({errorStatus: true, error: err}))
        else{
            if (result)
                return (res.json({errorStatus: false, product: result}))
            return (res.json({errorStatus: true, error: "product not found"}))
        }
    })
}

exports.update = async (req, res) => {
    // Products.findById(req.params.id, (err, foundResult) => {
    //     if (err)    return (res.json({errorStatus: true, error: "id not found"}))
    //     let {hash, createdAt, __v, _id, ...modifiedResult} = foundResult._doc
    //     let updatedProduct = {...modifiedResult, ...req.body}
    //     hash = calcHash(updatedProduct)
    //     Products.findByIdAndUpdate(req.params.id, {...req.body, hash}, {new: true}, (err, result) => {
    //         if (err)     return (res.json({errorStatus: true, error: err}))
    //         return (res.json({errorStatus: false, data: result}))
    //     })
    // })
    Products.findByIdAndUpdate(req.params.id, {...req.body}, {new: true}, (err, result) => {
        if (err)     return (res.json({errorStatus: true, error: err}))
        return (res.json({errorStatus: false, data: result}))
    })
}
exports.delete = (req, res) => {
    Products.findByIdAndDelete(req.params.id, (error, obj) => {
        if (error)    return (res.json({errorStatus: true, error}))
        if (!obj)     return (res.json({errorStatus: true, error: "wrong id"}))
        return (res.json({errorStatus: false, message: "Successfully deleted"}))
    })
}
exports.index = async (req, res) => {
    console.log(req);
}