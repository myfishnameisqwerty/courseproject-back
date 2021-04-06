const Products = require("../models/productModel")
const NewProducts = require("../models/newProductModel")
const calcHash = require('object-hash');
const fs = require('fs')
const minimumNewItems = 5
exports.create = async (req, res) => {
    try{
        let newProduct = {...req.body}
        newProduct = {...newProduct, hash: calcHash(newProduct)}
        Products.findOne({hash:newProduct.hash}, (err, result) => {
            if (!result)
                Products.create(newProduct , (err, obj) => {
                    if (err) return (res.json({errorStatus: true, error: err}))
                    else {
                        Products.findByIdAndUpdate(obj._id, {id:obj._id}, {new: true}, (err, result) => {
                            if (err)     return (res.json({errorStatus: true, error: err}))
                            if (!addNewProduct(obj, res, 7))
                                return (res.json({result}))
                            return (res.json({errorStatus: true, error: "Cannot add product. Contact the support."})) 
                        })
                        
                    }
                })
            else    return (res.json({errorStatus: true, message: "This product is allready exists"}))
        })
        
    }
    catch (err){
        
        res.status(500).json({errorStatus: true, error: err})
    }
}

exports.getProduct = async (req, res) => {
    
    Products.findById(req.params.id, (err, result) => {
        if (err)
            return (res.json({errorStatus: true, error: err}))
        else{
            if (result){
                return (res.json(result))
                }
            return (res.json({errorStatus: true, error: "product not found"}))
        }
    })
}

exports.update = async (req, res) => {
    // Products.findById(req.params.id, (err, foundResult) => {
    //     if (err)    return (res.json({errorStatus: true, error: "id not found"}))
    //     let {hash, createdAt, __v, _id, ...modifiedResult} = foundResult._doc
    //     let updatedProduct = {...modifiedResult, ...req.body}
    //     console.log(updatedProduct);
    //     hash = calcHash(updatedProduct); 
    //     Products.findByIdAndUpdate(req.params.id, {...req.body, hash}, {new: true}, (err, result) => {
    //         if (err)     return (res.json({errorStatus: true, error: err}))
    //         return (res.json({errorStatus: false, data: result}))
    //     })
    // })
    Products.findByIdAndUpdate(req.params.id, {...req.body}, {new: true}, (err, result) => {
        if (err)     return (res.json({errorStatus: true, error: err}))
        return (res.json(result))
    })
}
exports.delete = (req, res) => {
    Products.findByIdAndDelete(req.params.id, (error, obj) => {
        if (error)    return (res.json({errorStatus: true, error}))
        if (!obj)     return (res.json({errorStatus: true, error: "wrong id"}))
        NewProducts.findByIdAndDelete(req.params.id, err => {
            logError("cannot find new_product", err);
        })
        return (res.json(obj))
    })
}

exports.index = async (req, res) => {
    
    const limit_ = 10;
    let aggregate_options = [];

    //PAGINATION
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || limit_;

    //set the options for pagination
    let options = {
        page, limit,
        collation: {locale: 'en'},
        customLabels: {
            totalDocs: 'totalResults',
            docs: 'products'
        }   
    }
    
    let match = {};
    if (req.query.range){
        let [from, to] = JSON.parse(req.query.range)
        options.limit = to+1-from
        options.page=(to+1)/options.limit
    }
    
    
    if (req.query.filter && Object.keys(JSON.parse(req.query.filter)).length){
        let search = JSON.parse(req.query.filter)
        let query = ""
        if (Array.isArray(search[Object.keys(search)[0]])){
            search[Object.keys(search)[0]].forEach(element => {
                if (query)
                    query += `|${element}`
                else
                    query = element
            })
            
        }
        else{
            query = search[Object.keys(search)[0]]
        }
        match[Object.keys(search)[0]] = {$regex: query, $options: 'i'};    
        aggregate_options.push({$match: match});
    } 

    
    if (req.query.sort){
        let [sortBy, sortOrder] = JSON.parse(req.query.sort)
        sortOrder = sortOrder.toLowerCase()==='desc'? -1 :1
        aggregate_options.push({$sort: {[sortBy]: sortOrder}});
    }
    
    const myAggregate = Products.aggregate(aggregate_options);
    const result = await Products.aggregatePaginate(myAggregate, options);
    
    res.setHeader('Content-Range', `${result.products.length}`)
    res.status(200).json(result.products);
}

function addNewProduct(obj, res, keepLastDays) {
    let errorStatus = false
    NewProducts.create({ _id: obj._id, createdAt: obj.createdAt }, (err, resp) => {
        if (err) {
            errorStatus = true
            logError("cannot create new_product", err);
        }
    })
    
    Products.find({}, (error, result) => {
        if (error){
            errorStatus = true
            logError("cannot find new_product", error);
        }
        
        let oldest = result[0]
        result.forEach(product =>{
            if (oldest.createdAt < product.createdAt)
                oldest=product
        })
        
        if (1000*60*60*24*keepLastDays - (new Date() - oldest.createdAt)< 0 && result.length > minimumNewItems) // oldest then X days
            NewProducts.findByIdAndDelete(oldest._id, (err) => {
                if (err){
                    errorStatus = true
                    logError("cannot find new_product", err)
                }
            })

    })
    return errorStatus
}
function logError(msg, err) {
    fs.appendFile('error_log.txt', `\n${new Date()} \nError message: ${msg}. ${err}`, function (badfileread) {
        if (badfileread)
            throw badfileread;
    });
}

