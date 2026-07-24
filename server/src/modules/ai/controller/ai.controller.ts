import { Request, Response, NextFunction } from 'express';
import { AiService } from '../service/ai.service.js';
import { PromptRequestDto } from '../dto/ai.dto.js';

export class AiController {
  private aiService = new AiService();

  streamChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customProvider = req.headers['x-ai-provider'] as string | undefined;
      const customApiKey = req.headers['x-ai-api-key'] as string | undefined;

      const dto = req.body as PromptRequestDto;
      if (!dto.mode || !dto.messages || !Array.isArray(dto.messages)) {
        return res.status(400).json({
          success: false,
          message: 'mode and messages array are required.',
        });
      }

      await this.aiService.streamChatCompletion(dto, customProvider, customApiKey, res);
    } catch (error) {
      next(error);
    }
  };
}
