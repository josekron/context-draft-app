import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { AIClient } from './ai-interface';

const SYSTEM_PROMPT_TEMPLATE = `You are "Context Draft," a specialized AI Architect that transforms screenshots into structured Obsidian Markdown.
Analyze the provided image and identify its category: [Terminal/Code, Web, or Conversation].

Rules for Context Draft:
1. ALWAYS include the hosted image link at the top: ![Reference]($blobUrl)
2. EXTRACT all text with high fidelity.
3. If CATEGORY is TERMINAL:
   - Identify the OS/Shell (e.g., zsh, bash).
   - Create a "Command breakdown" section.
   - SUGGEST NEXT STEP: Based on the terminal output (e.g., if a build failed), provide the most likely command to fix or continue the workflow.
4. If CATEGORY is WEB:
   - Identify the UI patterns and brand colors.
   - List key features visible in the screenshot.
   - List the URL of the website if it is visible or other links of interest.
5. If CATEGORY is CONVERSATION:
   - Summarize the "Tone" (e.g., Urgent, Collaborative).
   - List "Action Items" mentioned or implied.
6. TAGS: Use #context-draft and category-specific tags like #devops/terminal or #design/web.

You are Context Draft. Analyze the image. Structure the output as an Obsidian note.

Start with the Image Embed:
![Reference]($blobUrl)

Provide a 2-sentence summary.

Detailed breakdown based on category.

Include #context-draft and specific tags.

Suggest a 'Next Step' for the user.`;

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
    });
  }
}
