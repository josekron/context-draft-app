import { GeminiAIClient } from '@/lib/gemini-ai-client';
import { NextResponse } from 'next/server';

const aiClient = new GeminiAIClient();

export async function POST(req: Request) {
  try {
    const { imageUrl, imageBase64 } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const result = await aiClient.getContextDraftStream(imageUrl, imageBase64);
    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error('Error analyzing image:', error);
    // Vercel AI SDK useCompletion parses the text body of a >=400 response as the thrown error message.
    const msg = error instanceof Error ? error.message : 'Failed to analyze image';
    return new Response(msg, { status: 500 });
  }
}
