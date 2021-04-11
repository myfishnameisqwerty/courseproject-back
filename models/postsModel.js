const mongoose = require("mongoose")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const postSchema = new mongoose.Schema({
    id: String,
    createdAt: {
        type: Date,
        default: new Date()
    },
    header: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    pictures: [String]
})
postSchema.plugin(aggregatePaginate);
const postModel = mongoose.model("posts", postSchema)
module.exports = postModel