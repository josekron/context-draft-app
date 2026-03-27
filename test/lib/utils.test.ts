import { describe, test, expect } from 'vitest';
import { randomizeFilename } from '../../lib/utils';

/**
 * Test cases for filename randomization.
 * These can be run with a standard test runner like vitest or jest.
 */

describe('randomizeFilename', () => {
  test('should append a UUID to a filename with an extension', () => {
    const filename = 'screenshot.png';
    const result = randomizeFilename(filename);
    
    // Check if it starts with 'screenshot-'
    expect(result.startsWith('screenshot-')).toBe(true);
    // Check if it ends with '.png'
    expect(result.endsWith('.png')).toBe(true);
    // Check if it contains a UUID (rough check for length and format)
    // format: screenshot-[uuid].png
    const nameWithoutExt = result.substring(0, result.lastIndexOf('.'));
    const parts = nameWithoutExt.split('-');
    // Expect parts: ["screenshot", "uuid_part1", "uuid_part2", ...]
    expect(parts.length).toBeGreaterThan(2); 
  });

  test('should handle filenames with no extension', () => {
    const filename = 'readme';
    const result = randomizeFilename(filename);
    
    expect(result.startsWith('readme-')).toBe(true);
    // Should not have a dot if the original didn't
    expect(result.includes('.')).toBe(false);
  });

  test('should handle filenames with multiple dots', () => {
    const filename = 'archive.tar.gz';
    const result = randomizeFilename(filename);
    
    expect(result.startsWith('archive.tar-')).toBe(true);
    expect(result.endsWith('.gz')).toBe(true);
  });

  test('should generate unique filenames for the same input', () => {
    const filename = 'image.jpg';
    const result1 = randomizeFilename(filename);
    const result2 = randomizeFilename(filename);
    
    expect(result1).not.toBe(result2);
  });
});
