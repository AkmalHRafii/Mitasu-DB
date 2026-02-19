function errorHandler(err, req, res, next) {
    switch (err.name) {
        case "Bad Request":
            res.status(err.statusCode).json({message: err.message})
            break;

        case "Unauthorized":
            res.status(err.statusCode).json({message: err.message})
            break;

        case "Not Found":
            res.status(err.statusCode).json({message: err.message})
            break;

        case "Forbidden":
            res.status(err.statusCode).json({message: err.message})
            break;

        case "SequelizeValidationError":
            res.status(400).json({message: err.errors[0].message})
            break;

        case "SequelizeUniqueConstraintError":
            res.status(400).json({message: err.errors[0].message})
            break;
    
        default:
            res.status(500).json({message: "Internal Server Error"})
            break;
    }
}

module.exports = errorHandler