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
