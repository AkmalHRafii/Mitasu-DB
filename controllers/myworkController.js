const { Mywork } = require('../models');
const { client, uploadcareSimpleAuthSchema } = require("../helpers/uploadcare")
const { UploadClient } = require('@uploadcare/upload-client')
const { fileInfo, UploadcareSimpleAuthSchema } = require('@uploadcare/rest-client');


class MyworkController {
    static async create(req, res, next) {
        try {
            const { title, imageUrl } = req.body;
            const UserId = req.user.id;
            const mywork = await Mywork.create({ title, imageUrl, UserId });
            res.status(201).json(mywork);
        } catch (error) {
            next(error);
        }
    }

    static async findAll(req, res, next) {
        try {
            const UserId = req.user.id;
            const myworks = await Mywork.findAll({ where: { UserId } });
            res.status(200).json(myworks);
        } catch (error) {
            next(error);
        }
    }

    static async findOne(req, res, next) {
        try {
            const { id } = req.params;
            const UserId = req.user.id;
            const mywork = await Mywork.findOne({
                where: {
                    id: id,
                    UserId: UserId
                }
            });
            if (!mywork) {
                throw { name: "Not Found", statusCode: 404, message: "Not Found" };
            }
            res.status(200).json(mywork);
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const { title, imageUrl } = req.body;
            const UserId = req.user.id;
            const mywork = await Mywork.findOne({
                where: {
                    id: id,
                    UserId: UserId
                }
            });
            if (!mywork) {
                throw { name: "Not Found", statusCode: 404, message: "Not Found" };
            }
            mywork.title = title;
            mywork.imageUrl = imageUrl;
            await mywork.save();
            res.status(200).json(mywork);
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const UserId = req.user.id;
            const mywork = await Mywork.findOne({
                where: {
                    id: id,
                    UserId: UserId
                }
            });
            if (!mywork) {
                throw { name: "Not Found", statusCode: 404, message: "Not Found" };
            }
            await mywork.destroy();
            res.status(200).json({ message: 'Mywork deleted' });
        } catch (error) {
            next(error);
        }
    }

    static async upload(req, res, next) {
        try {
            const { id } = req.params
            const UserId = req.user.id;
            const result = await client.uploadFile(req.file.buffer, {
                fileName: req.file.originalName,
                contentType: req.file.mimetype
            })

            const imageUrl = result.cdnUrl

            const mywork = await Mywork.findOne({
                where: {
                    id: id,
                    UserId: UserId
                }
            });
            if (!mywork) {
                throw { name: "Not Found", statusCode: 404, message: "Not Found" };
            }
            const fileInfoResult = await fileInfo(
                {
                    uuid: result.uuid,
                },
                { authSchema: uploadcareSimpleAuthSchema }
            )
            await mywork.update({
                imageUrl: fileInfoResult.originalFileUrl
            })
            res.status(200).json(mywork);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MyworkController
