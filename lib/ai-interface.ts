import { StreamTextResult } from 'ai';

export interface AIClient {
  getContextDraftStream(imageUrl: string, imageBase64?: string, analysisHints?: string): StreamTextResult<Record<string, never>, never>;
}
