const jwt = require('jsonwebtoken')
const Users = require("../models/userModel")
const Roles = require("../models/userRolesModel")
exports.isAuthorised =  (req, res, next) => {
    if (this.checkToken(req, res))     next()
}

exports.isAdmin = async (req, res, next) => {
    const email = this.checkToken(req, res)
    if (email){
        const {name} = await getUserRoleData(email)
        if (name === 'admin')   next()
        else    return rejectAcess(res)
    }
}

exports.privilegeUser = async (req, res, next) =>{
    const email = this.checkToken(req, res)
    if (email){
        
        const {rank} = await getUserRoleData(email)
        if (rank >=5)   next()
        else    return rejectAcess(res)
    }
}

async function getUserRoleData(email) {
    const { role } = await Users.findOne({ email: email })
    const data = await Roles.findById(role)
    return data
}

exports.checkToken = (req, res) => {
    if (req.headers.authorization){

        const { authorization } = req.headers
        const token = authorization && authorization.split(' ')[1]
        if(token == null)
            return rejectAcess(res)
        let email = null
        jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
            if (err){
                return res.status(403).send({ message: 'bad token, not allowed' })
            }
            email = data.email
        })
        return email
    }
}
function rejectAcess(res) {
    return res.status(401).send({ message: 'Not allowed request' })
}

