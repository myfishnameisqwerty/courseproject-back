const mongoose = require("mongoose")
const jwt = require('jsonwebtoken')
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoosePaginate = require('mongoose-paginate-v2');
const UserSchema = new mongoose.Schema({
    id: String,
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_roles",
        default: "606ae0123df5f00ce048aa44"
    },
    phone: {
        type: String,
        validate: {
            validator: function(v) {
                return /(?=^0)(?=^\d{10}$)/.test(v);
            },
            message: props => {
                return `${props.value} is not a valid phone number!`
            }
        }
    },
    address: {
        city: String,
        street: String,
        appartment: String
    }

})

UserSchema.statics.generateAccessToken = function (userData){
    return jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn: '2d' })
}
UserSchema.plugin(aggregatePaginate);

const UserModel = mongoose.model('users', UserSchema)
module.exports = UserModel