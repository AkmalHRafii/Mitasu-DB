const request = require('supertest');
const { User, Bookmark } = require('../models');

// Jest will pick up the mock from moduleNameMapper
const { GoogleGenerativeAI, mockGenerateContent, mockGetGenerativeModel } = require("@google/generative-ai");

const app = require('../app');
const { signToken } = require('../helpers/jwt');

let access_token;
let userId;
// Clean up database before and after tests
const { sequelize } = require('../models');
const { queryInterface } = sequelize;

beforeAll(async () => {
    // Reset mocks
    mockGenerateContent.mockReset();
    mockGetGenerativeModel.mockClear();
    GoogleGenerativeAI.mockClear();

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
        email: 'geminiuser@example.com',
        password: 'password123'
    });
    userId = user.id;
    access_token = signToken({ id: user.id, email: user.email });

    // Create some bookmarks for the user
    await Bookmark.create({
        mal_id: 1,
        title: 'Naruto',
        UserId: userId
    });
    await Bookmark.create({
        mal_id: 2,
        title: 'One Piece',
        UserId: userId
    });
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

describe('Gemini Controller', () => {

    describe('GET /ai/recommend', () => {
        it('should return recommendations successfully', async () => {
            const mockResponseData = {
                recommendations: ["Bleach", "Dragon Ball", "Hunter x Hunter"],
                reasoning: "Because you like Naruto and One Piece"
            };
            const mockResponseString = JSON.stringify(mockResponseData);

            // Mock the chain: model.generateContent -> result.response.text()
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => mockResponseString
                }
            });

            const response = await request(app)
                .get('/ai/recommend')
                .set('Authorization', `Bearer ${access_token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('recommendations');
            expect(response.body.recommendations).toEqual(expect.arrayContaining(["Bleach"]));

            expect(GoogleGenerativeAI).toHaveBeenCalledWith(process.env.GEMINI_API_KEY);
            expect(mockGetGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({
                model: "gemini-1.5-flash"
            }));
            expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining("Naruto, One Piece"));
        });

        it('should handle empty bookmarks', async () => {
            // Create a new user with no bookmarks
            const user2 = await User.create({
                email: 'nobookmarks@example.com',
                password: 'password123'
            });
            const token2 = signToken({ id: user2.id, email: user2.email });

            const response = await request(app)
                .get('/ai/recommend')
                .set('Authorization', `Bearer ${token2}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('recommendations', []);
            expect(response.body).toHaveProperty('reasoning');
        });

        it('should handle errors from Gemini API', async () => {
            const errorMessage = "Gemini API Error";
            mockGenerateContent.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .get('/ai/recommend')
                .set('Authorization', `Bearer ${access_token}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Gagal merekomendasikan anime.');
        });
    });
});
