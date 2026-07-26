import { PromptRequestDto, Message, SYSTEM_PROMPTS } from '../dto/ai.dto.js';
import { Response } from 'express';

export class AiService {
  async streamChatCompletion(
    dto: PromptRequestDto,
    customProvider: string | undefined,
    customApiKey: string | undefined,
    res: Response
  ): Promise<void> {

    const provider = (customProvider || 'groq').toLowerCase();
    const apiKey = customApiKey || process.env.DEFAULT_GROQ_KEY;

    // Inject System Prompt
    const systemPromptText = SYSTEM_PROMPTS[dto.mode] || 'You are a helpful AI agricultural assistant.';
    const systemMessage: Message = {
      role: 'system',
      content: systemPromptText,
    };

    const finalMessages = [systemMessage, ...dto.messages];

    // If context data was provided, inject it as system instruction or a user msg
    if (dto.contextData) {
      finalMessages.push({
        role: 'system',
        content: `Context Metadata: ${JSON.stringify(dto.contextData)}`,
      });
    }

    // Configure URL, model, and headers based on provider
    let apiUrl = '';
    let bodyPayload: any = {};
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (provider === 'openai') {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      bodyPayload = {
        model: 'gpt-4o',
        messages: finalMessages,
        stream: true,
      };
    } else if (provider === 'gemini') {
      // Gemini Developer API (SSE compatible or standard endpoint)
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`;
      bodyPayload = {
        contents: finalMessages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      };
    } else if (provider === 'claude') {
      apiUrl = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      bodyPayload = {
        model: 'claude-3-5-sonnet-20240620',
        messages: finalMessages.filter((m) => m.role !== 'system'),
        system: systemPromptText,
        max_tokens: 1024,
        stream: true,
      };
    } else if (provider === 'mistral') {
      apiUrl = 'https://api.mistral.ai/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      bodyPayload = {
        model: 'mistral-large-latest',
        messages: finalMessages,
        stream: true,
      };
    } else {
      // Default to GROQ (OpenAI Compatible)
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      bodyPayload = {
        model: 'llama-3.1-8b-instant',
        messages: finalMessages,
        stream: true,
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Provider ${provider} returned error: ${response.status} - ${errorText}`);
      }

      // Stream the response body as SSE (Server-Sent Events) chunks
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('Readable stream not supported on response body.');
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      }
      res.end();
    } catch (error: any) {
      console.error('[AI Service Error]', error);
      res.status(500).write(`data: [ERROR] ${error.message}\n\n`);
      res.end();
    }
  }
}
