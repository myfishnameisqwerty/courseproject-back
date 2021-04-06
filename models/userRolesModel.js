const mongoose = require("mongoose")
const userRolesSchema = new mongoose.Schema({
    id: String,
    name: {
        type: String,
        required: true
    },
    rank: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: props => {
                return `${props.value} is not an integer value`
            }
        }
    }
})
const userRolesModel = mongoose.model("user_roles", userRolesSchema)
module.exports = userRolesModel