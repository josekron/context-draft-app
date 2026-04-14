import { GeminiAIClient } from '@/lib/gemini-ai-client';
import { NextResponse } from 'next/server';

const aiClient = new GeminiAIClient();

function getErrorMetadata(error: unknown): { statusCode?: number; providerStatus?: string } {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const maybeError = error as {
    statusCode?: number;
    data?: { error?: { code?: number; status?: string } };
  };

  const statusCode = typeof maybeError.statusCode === 'number'
    ? maybeError.statusCode
    : typeof maybeError.data?.error?.code === 'number'
      ? maybeError.data.error.code
      : undefined;

  const providerStatus = typeof maybeError.data?.error?.status === 'string'
    ? maybeError.data.error.status
    : undefined;

  return { statusCode, providerStatus };
}

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
    const { statusCode, providerStatus } = getErrorMetadata(error);

    if (statusCode === 503 || providerStatus === 'UNAVAILABLE') {
      return NextResponse.json(
        {
          error: 'Gemini is currently unavailable. Please try again in a moment.',
          code: 503,
        },
        { status: 503 },
      );
    }

    const msg = error instanceof Error ? error.message : 'Failed to analyze image';
    return NextResponse.json({ error: msg, code: statusCode ?? 500 }, { status: statusCode ?? 500 });
  }
}
