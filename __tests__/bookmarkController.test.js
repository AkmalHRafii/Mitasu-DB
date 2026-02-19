const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const { queryInterface } = sequelize;
const { signToken } = require('../helpers/jwt');
const { User, Bookmark } = require('../models');

let access_token;
let userId;

// Clean up database before and after tests
beforeAll(async () => {
    await queryInterface.bulkDelete('Bookmarks', null, {
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
        email: 'bookmarkuser@example.com',
        password: 'password123'
    });
    userId = user.id;
    access_token = signToken({ id: user.id, email: user.email });
});

afterAll(async () => {
    await queryInterface.bulkDelete('Bookmarks', null, {
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

describe('Bookmark Controller', () => {
    describe('POST /bookmark', () => {
        it('should add a bookmark successfully', async () => {
            const response = await request(app)
                .post('/bookmark')
                .set('Authorization', `Bearer ${access_token}`)
                .send({
                    mal_id: 12345,
                    title: 'Naruto'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('newBookmark');
            expect(response.body.newBookmark).toHaveProperty('mal_id', 12345);
            expect(response.body.newBookmark).toHaveProperty('title', 'Naruto');
            expect(response.body.newBookmark).toHaveProperty('UserId', userId);
        });

        it('should fail to add a bookmark without title', async () => {
            const response = await request(app)
                .post('/bookmark')
                .set('Authorization', `Bearer ${access_token}`)
                .send({
                    mal_id: 12345
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /bookmark', () => {
        it('should fetch all bookmarks for the user', async () => {
            const response = await request(app)
                .get('/bookmark')
                .set('Authorization', `Bearer ${access_token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('bookmarks');
            expect(Array.isArray(response.body.bookmarks)).toBe(true);
            expect(response.body.bookmarks.length).toBeGreaterThan(0);
            expect(response.body.bookmarks[0]).toHaveProperty('mal_id', 12345);
            expect(response.body.bookmarks[0]).toHaveProperty('title', 'Naruto');
        });
    });

    describe('DELETE /bookmark/:id', () => {
        it('should delete a bookmark successfully', async () => {
            // First get the bookmark id to delete
            const getResponse = await request(app)
                .get('/bookmark')
                .set('Authorization', `Bearer ${access_token}`);

            const bookmarkId = getResponse.body.bookmarks[0].id;

            const response = await request(app)
                .delete(`/bookmark/${bookmarkId}`)
                .set('Authorization', `Bearer ${access_token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Bookmark deleted');
        });

        it('should fail to delete a non-existent bookmark', async () => {
            const response = await request(app)
                .delete('/bookmark/99999')
                .set('Authorization', `Bearer ${access_token}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Not Found');
        });
    });
});
