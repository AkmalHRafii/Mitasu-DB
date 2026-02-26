const bcrypt = require("bcryptjs")

function hashPass(password) {
    return bcrypt.hashSync(password, 10)
}

function comparePass(password, hash) {
    return bcrypt.compareSync(password, hash)
}

module.exports = {hashPass, comparePass}