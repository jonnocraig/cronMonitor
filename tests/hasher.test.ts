import { describe, it, expect } from 'vitest';
import { computeMd5 } from '../src/hasher.js';

describe('computeMd5', () => {
  it('returns consistent hash for same input', () => {
    const hash1 = computeMd5('hello');
    const hash2 = computeMd5('hello');
    expect(hash1).toBe(hash2);
  });

  it('returns different hash for different input', () => {
    const hash1 = computeMd5('hello');
    const hash2 = computeMd5('world');
    expect(hash1).not.toBe(hash2);
  });

  it('returns 32-character hex string', () => {
    const hash = computeMd5('test');
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it('returns known MD5 hash for empty string', () => {
    // Known MD5 hash of empty string
    const hash = computeMd5('');
    expect(hash).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('handles unicode content', () => {
    const hash = computeMd5('Hello, 世界! 🌍');
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it('handles large content', () => {
    const largeContent = 'a'.repeat(100000);
    const hash = computeMd5(largeContent);
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });
});
