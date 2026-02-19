const { comparePass } = require("../helpers/bcryptjs")
const { signToken } = require("../helpers/jwt")
const {User, Bookmark} = require("../models")


class UserController{
    static async register(req, res, next) {
        try {
            const {email, password} = req.body
            if(!email) {
                throw {name: "Bad Request", statusCode: 400, message: "Email Required"}
            }
            if(!password) {
                throw {name: "Bad Request", statusCode: 400, message: "Password Required"}
            }

            let newUser = await User.create({email, password})
            res.status(201).json({
                status: "Success",
                data: {
                    id: newUser.id,
                    email: newUser.email
                }
            })
        } catch (error) {
            next(error)
        }
    }

    static async login(req, res, next) {
        try {
            const {email, password} = req.body
            if(!email) {
                throw {name: "Bad Request", statusCode: 400, message: "Email Required"}
            }
            if(!password) {
                throw {name: "Bad Request", statusCode: 400, message: "Password Required"}
            }
            let user = await User.findOne({
                where: {
                    email: email
                }
            })

            let isValidPassword = comparePass(password, user.password)
            if(!isValidPassword) {
                throw {name: "Unauthorized", statusCode: 401, message: "Invalid Password"}
            }
            let payload = {
                id: user.id,
                email: user.email
            }

            let access_token = signToken(payload)
            res.status(200).json({
                access_token
            })
        } catch (error) {
            next(error)
        }
    }

    static async updateUserName(req, res, next) {
        try {
            const {id} = req.user
            const {userName} = req.body
            let user = await User.findOne({
                where: {
                    id: id
                }
            })
            await user.update({userName})
            res.status(200).json({
                status: "Success",
                userName: user.userName
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = UserController