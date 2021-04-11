const Statuses = require("../models/orderStatusModel")

exports.create = async (req, res) => {
    Statuses.findOne({name: req.body.name}, (error, response) => {
        if (!response)
            Statuses.create(req.body, (err, obj) => {
                if (err)    return res.json({errorStatus: true, error: err})
                Statuses.findByIdAndUpdate(obj._id, {id:obj._id}, {new: true}, (err, result) => {
                    if (err)    return res.json({errorStatus: true, error: err})
                    return res.json(result)
                })
            })
        else    return res.json({errorStatus: true, error: "Status exists"})
    })
}

exports.findOne = async (req, res) => {
    Statuses.findById(req.params.id, (err, result) => {
        if (err)
            return (res.json({errorStatus: true, error: err}))
        else{
            if (result){
                return (res.json(result))
                }
            return (res.json({errorStatus: true, error: "Status not found"}))
        }
    })
}
exports.findAll = async (req, res) => {
    Statuses.find({}, (err, result) => {
        if (err)
            return (res.json({errorStatus: true, error: err}))        
        return (res.json(result))
    })
}
exports.delete = async (req, res) => {
    Statuses.findByIdAndDelete(req.params.id, (err, result) => {
        if (err)
            return (res.json({errorStatus: true, error: err}))        
        return (res.json(result))
    })
}
exports.update = async (req, res) => {
    Statuses.findByIdAndUpdate(req.params.id, {...req.body}, {new: true}, (err, result) => {
        if (err)     return (res.json({errorStatus: true, error: err}))
        return (res.json(result))
    })
}
