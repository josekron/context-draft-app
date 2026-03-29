import { GeminiAIClient } from '@/lib/gemini-ai-client';
import { NextResponse } from 'next/server';

const aiClient = new GeminiAIClient();

export async function POST(req: Request) {
  try {
    const { imageUrl, imageBase64, analysisHints } = await req.json();

    if (!imageUrl && !imageBase64) {
      return NextResponse.json({ error: 'Image data (imageUrl or imageBase64) is required' }, { status: 400 });
    }

    const result = await aiClient.getContextDraftStream(imageUrl, imageBase64, analysisHints);
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Caught Error in Route:', error);
    // Vercel AI SDK useCompletion parses the text body of a >=400 response as the thrown error message.
    const msg = error instanceof Error ? error.message : 'Failed to analyze image';
    return new Response(msg, { status: 500 });
  }
}
