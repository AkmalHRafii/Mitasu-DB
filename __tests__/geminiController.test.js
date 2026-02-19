const request = require('supertest');
const { signToken } = require('../helpers/jwt');
const { User, Bookmark } = require('../models');

// Mock GoogleGenerativeAI BEFORE requiring app
const mockGenerateContent = jest.fn();

jest.mock("@google/genai", () => {
    return {
        GoogleGenAI: jest.fn().mockImplementation(() => ({
            models: {
                generateContent: mockGenerateContent
            }
        }))
    };
});

// Now require app, which will load the controller and use the mock
const app = require('../app');
const { GoogleGenAI } = require("@google/genai");

let access_token;
let userId;
// Clean up database before and after tests
const { sequelize } = require('../models');
const { queryInterface } = sequelize;

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
    beforeEach(() => {
        // Reset mocks
        mockGenerateContent.mockUpdated = true;
    });

    describe('GET /ai/recommend', () => {
        it('should return recommendations successfully', async () => {
            const mockResponseText = {
                recommendations: ["Bleach", "Dragon Ball", "Hunter x Hunter"],
                reasoning: "Because you like Naruto and One Piece"
            };
            const mockResponseString = JSON.stringify(mockResponseText);

            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => mockResponseString
                }
            });

            const response = await request(app)
                .get('/ai/recommend')
                .set('Authorization', `Bearer ${access_token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('recommendations', mockResponseString);
        });

        it('should handle errors from Gemini API', async () => { // Fixed typo
            const errorMessage = "Gemini API Error";
            mockGenerateContent.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .get('/ai/recommend')
                .set('Authorization', `Bearer ${access_token}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message');
        });
    });
});
