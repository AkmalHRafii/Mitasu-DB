const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent
});

const GoogleGenerativeAI = jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel
}));

module.exports = {
    GoogleGenerativeAI,
    mockGetGenerativeModel,
    mockGenerateContent
};
