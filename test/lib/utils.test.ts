import { describe, test, expect } from 'vitest';
import { normalizeErrorMessage, randomizeFilename } from '../../lib/utils';

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

describe('normalizeErrorMessage', () => {
  test('returns Gemini unavailable for JSON error code != 200', () => {
    const result = normalizeErrorMessage(JSON.stringify({ code: 503, error: 'provider error' }));
    expect(result).toBe('Gemini is currently unavailable. Please try again in a moment.');
  });

  test('returns Gemini unavailable for JSON status != 200', () => {
    const result = normalizeErrorMessage(JSON.stringify({ status: 500 }));
    expect(result).toBe('Gemini is currently unavailable. Please try again in a moment.');
  });

  test('returns Gemini unavailable for object statusCode != 200', () => {
    const result = normalizeErrorMessage({ statusCode: 503, message: 'Retry exhausted' });
    expect(result).toBe('Gemini is currently unavailable. Please try again in a moment.');
  });

  test('returns raw message when code is 200', () => {
    const result = normalizeErrorMessage(JSON.stringify({ code: 200, message: 'ok-ish but no output' }));
    expect(result).toBe('{"code":200,"message":"ok-ish but no output"}');
  });

  test('returns fallback when message is empty', () => {
    const result = normalizeErrorMessage('');
    expect(result).toBe('An unexpected error occurred while analyzing the screenshot. Please try again.');
  });
});
