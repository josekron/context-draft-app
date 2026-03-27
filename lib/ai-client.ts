import { streamText, type LanguageModel } from 'ai';


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

export function getContextDraftStream(imageUrl: string, imageBase64?: string) {
  // Use Uint8Array to resolve private blob fetch issues in Gemini
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

  // We explicitly replace the placeholder with the actual blob URL
  const prompt = SYSTEM_PROMPT_TEMPLATE.replace(/\$blobUrl/g, imageUrl);

  return streamText({
    model: 'google/gemini-3-flash-preview' as unknown as LanguageModel,
    system: prompt,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this screenshot.' },
          // AI SDK can consume either remote URLs or Uint8Arrays/Buffers seamlessly
          { type: 'image', image: imagePayload },
        ],
      },
    ],
  });
}
