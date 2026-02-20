const request = require('supertest');
const { User, Mywork } = require('../models');

// Mock Uploadcare dependencies BEFORE requiring app
jest.mock('../helpers/uploadcare', () => ({
    client: {
        uploadFile: jest.fn()
    },
    uploadcareSimpleAuthSchema: {}
}));

jest.mock('@uploadcare/rest-client', () => ({
    fileInfo: jest.fn(),
    UploadcareSimpleAuthSchema: jest.fn()
}));

const { client } = require('../helpers/uploadcare');
const { fileInfo } = require('@uploadcare/rest-client');

const app = require('../app');
const { signToken } = require('../helpers/jwt');

let access_token;
let userId;
const { sequelize } = require('../models');
const { queryInterface } = sequelize;

beforeAll(async () => {
    await queryInterface.bulkDelete('Myworks', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true
    });
    await queryInterface.bulkDelete('Users', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true
    });

    const user = await User.create({
        email: 'myworkuser@example.com',
        password: 'password123'
    });
    userId = user.id;
    access_token = signToken({ id: user.id, email: user.email });
});

afterAll(async () => {
    await queryInterface.bulkDelete('Myworks', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true
    });
    await queryInterface.bulkDelete('Users', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true
    });
    await sequelize.close();
});

describe('Mywork Controller', () => {
    let myworkId;

    describe('POST /mywork', () => {
        it('should create a new mywork successfully', async () => {
            const response = await request(app)
                .post('/mywork')
                .set('Authorization', `Bearer ${access_token}`)
                .send({
                    title: 'Test Work',
                    imageUrl: 'http://example.com/image.png'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('title', 'Test Work');
            expect(response.body).toHaveProperty('imageUrl', 'http://example.com/image.png');
            expect(response.body).toHaveProperty('UserId', userId);
            myworkId = response.body.id;
        });

        it('should fail if unauthenticated', async () => {
            const response = await request(app)
                .post('/mywork')
                .send({
                    title: 'Test Work',
                    imageUrl: 'http://example.com/image.png'
                });
            expect(response.status).toBe(401);
        });
    });

    describe('GET /mywork', () => {
        it('should find all myworks for the user', async () => {
            const response = await request(app)
                .get('/mywork')
                .set('Authorization', `Bearer ${access_token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    describe('PUT /mywork/:id', () => {
        it('should update a mywork successfully', async () => {
            const response = await request(app)
                .put(`/mywork/${myworkId}`)
                .set('Authorization', `Bearer ${access_token}`)
                .send({
                    title: 'Updated Work',
                    imageUrl: 'http://example.com/updated.png'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('title', 'Updated Work');
        });

        it('should return 404 if mywork not found', async () => {
            const response = await request(app)
                .put('/mywork/999')
                .set('Authorization', `Bearer ${access_token}`)
                .send({
                    title: 'Updated Work'
                });
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /mywork/:id', () => {
        it('should delete a mywork successfully', async () => {
            const response = await request(app)
                .delete(`/mywork/${myworkId}`)
                .set('Authorization', `Bearer ${access_token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Mywork deleted');
        });
    });

    describe('POST /mywork/upload/:id', () => {
        let uploadId;
        beforeEach(async () => {
            const res = await Mywork.create({
                title: 'For Upload',
                imageUrl: 'initial.png',
                UserId: userId
            });
            uploadId = res.id;
        });

        it('should upload a file and update mywork successfully', async () => {
            const mockFile = Buffer.from('fake image data');
            client.uploadFile.mockResolvedValue({
                cdnUrl: 'http://cdn.uploadcare.com/uuid/',
                uuid: 'uuid-123'
            });

            fileInfo.mockResolvedValue({
                originalFileUrl: 'http://example.com/original.png'
            });

            const response = await request(app)
                .post(`/mywork/upload/${uploadId}`)
                .set('Authorization', `Bearer ${access_token}`)
                .attach('imageUrl', mockFile, 'test.png');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('imageUrl', 'http://example.com/original.png');
            expect(client.uploadFile).toHaveBeenCalled();
            expect(fileInfo).toHaveBeenCalled();
        });
    });
});
