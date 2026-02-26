const jwt = require("jsonwebtoken")
const secretKey = process.env.JWT_SECRET_KEY

function signToken(payload) {
    return jwt.sign(payload, secretKey)
}

function verifyToken(token) {
    try {
        return jwt.verify(token, secretKey)
    } catch (error) {
        return null
    }
}

module.exports = {signToken, verifyToken}