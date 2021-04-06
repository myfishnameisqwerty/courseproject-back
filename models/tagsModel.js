const mongoose = require("mongoose")
const tagSchema = new mongoose.Schema({
    id: String,
    name: {
        type: String,
        required: true
    }
})
const tagModel = mongoose.model("tags", tagSchema)
module.exports = tagModel