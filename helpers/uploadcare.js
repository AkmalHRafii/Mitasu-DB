const { UploadClient } = require('@uploadcare/upload-client')
const { fileInfo, UploadcareSimpleAuthSchema } = require('@uploadcare/rest-client');


const client = new UploadClient({
    publicKey: process.env.PUBLIC_KEY
})

const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
    publicKey: process.env.PUBLIC_KEY,
    secretKey: process.env.SECRET_KEY,
});


module.exports = { client, uploadcareSimpleAuthSchema }