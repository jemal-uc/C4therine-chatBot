import { getValidatedAIResponse } from '../services/aiService.js';

export const handleChat = async (req, res) => {
    try {
        const { prompt, history = [] } = req.body;

        if (!prompt || prompt.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Prompt tidak boleh kosong."
            });
        }

        const sanitizedHistory = Array.isArray(history)
            ? history
                .filter((item) => typeof item === "string" && item.trim() !== "")
                .map((item) => item.trim())
                .slice(-20)
            : [];

        console.log(`\n[Controller] Menerima prompt baru: "${prompt}"`);

        const aiResult = await getValidatedAIResponse(prompt, sanitizedHistory);

        return res.status(200).json({
            success: true,
            data: aiResult
        });
    } catch (error) {
        console.error("[Controller] Fatal Server Error:", error);

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan internal pada server aplikasi."
        });
    }
};
