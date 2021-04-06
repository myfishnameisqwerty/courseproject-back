const mongoose = require("mongoose")
const statusSchema = new mongoose.Schema({
    id: String,
    name: {
        type: String,
        required: true
    }
})

const statusModel = mongoose.model("order_statuses", statusSchema)
module.exports = statusModel