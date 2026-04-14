/**
 * Utility functions for the Context Draft application.
 */

/**
 * Randomizes a filename by appending a UUID before the extension.
 * Format: [original]-[uuid].[extension]
 * 
 * @param filename The original filename (e.g., "screenshot.png")
 * @returns The randomized filename (e.g., "screenshot-550e8400-e29b-41d4-a716-446655440000.png")
 */
export function randomizeFilename(filename: string): string {
  const uuid = crypto.randomUUID();
  
  // Find the last dot to separate name and extension
  const lastDotIndex = filename.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    // No extension
    return `${filename}-${uuid}`;
  }
  
  const name = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex); // includes the dot
  
  return `${name}-${uuid}${extension}`;
}

/**
 * Normalizes analysis errors into user-facing messages.
 * Primary rule: if a parsed error code is not 200, return Gemini unavailable message.
 */
export function normalizeErrorMessage(input: unknown): string {
  const fallback = 'An unexpected error occurred while analyzing the screenshot. Please try again.';
  const unavailableFallback = 'Gemini is currently unavailable. Please try again in a moment.';
  const rawMessage = typeof input === 'string'
    ? input
    : input instanceof Error
      ? input.message
      : input && typeof input === 'object' && 'message' in input && typeof input.message === 'string'
        ? input.message
        : '';

  try {
    const parsed = JSON.parse(rawMessage) as { code?: number; status?: number };
    const code = typeof parsed.code === 'number' ? parsed.code : parsed.status;
    if (typeof code === 'number' && code !== 200) {
      return unavailableFallback;
    }
  } catch {
    // Ignore parse errors and continue with fallback handling.
  }

  if (
    input &&
    typeof input === 'object' &&
    'statusCode' in input &&
    typeof input.statusCode === 'number' &&
    input.statusCode !== 200
  ) {
    return unavailableFallback;
  }

  return rawMessage.trim() || fallback;
}
