const Tags = require("../models/tagsModel")
exports.create = async (req, res) => {
    Tags.findOne({name: req.body.name}, (error, response) => {
        if (!response)
            Tags.create(req.body, (err, obj) => {
                if (err)    return res.json({errorStatus: true, error: err})
                Tags.findByIdAndUpdate(obj._id, {id:obj._id}, {new: true}, (err, result) => {
                    if (err)    return res.json({errorStatus: true, error: err})
                    return res.json(result)
                })
            })
        else    return res.json({errorStatus: true, error: "Tag exists"})
    })
}
exports.findOne = async (req, res) => {
    Tags.findById(req.params.id, (err, result) => {
        if (err)
            return (res.json({errorStatus: true, error: err}))
        else{
            if (result){
                return (res.json(result))
                }
            return (res.json({errorStatus: true, error: "tag not found"}))
        }
    })
}
exports.findAll = async (req, res) => {
    Tags.find({}, (err, result) => {
        if (err)
            return (res.json({errorStatus: true, error: err}))        
        return (res.json(result))
    })
}
exports.delete = async (req, res) => {
    Tags.findByIdAndDelete(req.params.id, (err, result) => {
        if (err)
            return (res.json({errorStatus: true, error: err}))        
        return (res.json(result))
    })
}
exports.update = async (req, res) => {
    Tags.findByIdAndUpdate(req.params.id, {...req.body}, {new: true}, (err, result) => {
        if (err)     return (res.json({errorStatus: true, error: err}))
        return (res.json(result))
    })
}
