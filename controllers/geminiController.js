const { User, Bookmark } = require("../models")
const { GoogleGenerativeAI } = require("@google/generative-ai");



class GeminiController {

    static async recommend(req, res, next) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const userId = req.user.id;
            const bookmarks = await Bookmark.findAll({ where: { UserId: userId } });

            if (!bookmarks || bookmarks.length === 0) {
                return res.status(200).json({
                    recommendations: [],
                    reasoning: "Bookmark masih kosong. Tidak bisa merekomendasikan anime."
                });
            }

            const animeList = bookmarks.map(bookmark => bookmark.title).join(", ");

            const prompt = `I like the following works: ${animeList}. 
        Please tell me 3 recommended anime similar to these. 
        Output in the following JSON format: 
        { "recommendations": ["title1", "title2", "title3"], "reasoning": "string" }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();


            const jsonResponse = JSON.parse(text);


            res.status(200).json(jsonResponse);

        } catch (error) {
            console.error("Gemini API Error:", error);
            res.status(500).json({ error: "Gagal merekomendasikan anime." });
        }
    }
}

module.exports = GeminiController