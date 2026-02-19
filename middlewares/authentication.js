const { verifyToken } = require("../helpers/jwt")
const {User, Bookmark} = require("../models")

async function authentication(req, res, next) {
    try {
        const {authorization} = req.headers
        if(!authorization) {
            throw {name: "Unauthorized", statusCode: 401, message: "Please Login first!"}
        }
        const token = authorization.split(" ")[1]
        if(!token) {
            throw {name: "Unauthorized", statusCode: 401, message: "Invalid Token"}
        }

        const decodedToken = verifyToken(token)
        if(!decodedToken) {
            throw {name: "Unauthorized", statusCode: 401, message: "Invalid Token"}
        }

        let user = await User.findOne({
            where: {
                id: decodedToken.id,
                email: decodedToken.email
            }
        })
        req.user = {
            id: user.id,
            email: user.email
        }
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authentication