import { StreamTextResult } from 'ai';

export interface AIClient {
  getContextDraftStream(imageUrl: string, imageBase64?: string): StreamTextResult<any, any>;
}
