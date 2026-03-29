import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

/**
 * Uploads a file to Vercel Blob. 
 */
export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  if (!request.body) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  try {
    const blobFile = await request.blob();
    const result = await put(filename, blobFile, {
      access: 'public',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload' },
      { status: 500 }
    );
  }
}
