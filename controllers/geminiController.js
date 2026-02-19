const { User, Bookmark } = require("../models")
const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

class GeminiController {

    static async recommend(req, res, next) {
        try {
            const userId = req.user.id
            const bookmarks = await Bookmark.findAll({ where: { UserId: userId } })
            const animeList = bookmarks.map(bookmark => bookmark.title).join(", ")
            const prompt = `I like the following works: ${animeList}. Please tell me 3 recommended anime similar to these. Please respond in JSON format with the following structure: { "recommendations": ["anime1", "anime2", "anime3"], "reasoning": "reasoning" }. Do not include any other text.`
            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
            })
            const text = result.text
            res.status(200).json({
                recommendations: text
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = GeminiController