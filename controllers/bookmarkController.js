const { User, Bookmark } = require("../models")

class BookmarkController {
    static async read(req, res, next) {
        try {
            const userId = req.user.id
            let bookmarks = await Bookmark.findAll({
                where: {
                    UserId: userId
                }
            })
            res.status(200).json({
                bookmarks
            })
        } catch (error) {
            next(error)
        }
    }

    static async add(req, res, next) {
        try {
            const { mal_id } = req.body
            const userId = req.user.id
            let newBookmark = await Bookmark.create({ mal_id, UserId: userId })
            res.status(201).json({
                newBookmark
            })
        } catch (error) {
            next(error)
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params
            const userId = req.user.id
            let bookmark = await Bookmark.findOne({
                where: {
                    id: id,
                    UserId: userId
                }
            })
            if (!bookmark) {
                throw { name: "Not Found", statusCode: 404, message: "Not Found" }
            }
            await bookmark.destroy();
            res.status(200).json({ message: "Bookmark deleted" });
        } catch (error) {
            next(error)
        }
    }
}

module.exports = BookmarkController