import { AiService } from '../service/ai.service.js';
export class AiController {
    aiService = new AiService();
    streamChat = async (req, res, next) => {
        try {
            const customProvider = req.headers['x-ai-provider'];
            const customApiKey = req.headers['x-ai-api-key'];
            const dto = req.body;
            if (!dto.mode || !dto.messages || !Array.isArray(dto.messages)) {
                return res.status(400).json({
                    success: false,
                    message: 'mode and messages array are required.',
                });
            }
            await this.aiService.streamChatCompletion(dto, customProvider, customApiKey, res);
        }
        catch (error) {
            next(error);
        }
    };
}
