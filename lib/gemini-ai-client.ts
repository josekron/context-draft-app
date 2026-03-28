import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { AIClient } from './ai-interface';

const SYSTEM_PROMPT_TEMPLATE = `You are "Context Draft," a specialized AI Architect. Your task is to analyze a screenshot and return a structured response in a STRICT format.

Analyze the image and categorize it as exactly one of: [TERMINAL, WEB, CONVERSATION].

### OUTPUT RULES:
1. Always start with the image: ![Reference]($blobUrl)
2. Follow with the Summary section.
3. Follow with the Category-Specific sections. Do not display the category name.
4. Follow with the Tags section with specific tags for Obsidian.

### CATEGORY SPECIFICATIONS:
- If TERMINAL: Sections must be [Shell Identification, Command Breakdown, Next Steps].
- If WEB: Sections must be [Key Features, UI patterns and Brand Colors, URL List].
- If CONVERSATION: Sections must be [Extracted Text, Tone Summary, Action Items].

Analyze the image. Provide the output as an Obsidian note.`;

export class GeminiAIClient implements AIClient {
  getContextDraftStream(imageUrl: string, imageBase64?: string) {
    // Process image payload - ensure we handle base64 if provided
    let imagePayload: URL | Uint8Array = new URL(imageUrl);
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1];
      if (base64Data) {
        if (typeof Buffer !== 'undefined') {
          imagePayload = Buffer.from(base64Data, 'base64');
        } else {
          imagePayload = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        }
      }
    }

    const prompt = SYSTEM_PROMPT_TEMPLATE.replace(/\$blobUrl/g, imageUrl);

    return streamText({
      model: google('gemini-3.1-flash-lite-preview'),
      maxRetries: 3,
      system: prompt,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this screenshot.' },
            { type: 'image', image: imagePayload },
          ],
        },
      ],
      onError: ({ error }) => {
        throw new Error(`Failed to prompt: ${error}`);
      },
    });
  }
}
