import { streamText } from 'ai';

export interface AIClient {
  getContextDraftStream(
    imageUrl?: string,
    imageBase64?: string,
    analysisHints?: string
  ): ReturnType<typeof streamText>;
}
