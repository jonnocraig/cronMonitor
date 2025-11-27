import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectChange, MonitorResult } from '../src/monitor.js';

describe('detectChange', () => {
  describe('first run behavior', () => {
    it('returns isFirstRun: true when previousHash is null', () => {
      const result = detectChange('abc123', null);
      expect(result.isFirstRun).toBe(true);
    });

    it('returns changed: false on first run', () => {
      const result = detectChange('abc123', null);
      expect(result.changed).toBe(false);
    });

    it('returns the current hash on first run', () => {
      const result = detectChange('abc123', null);
      expect(result.hash).toBe('abc123');
    });
  });

  describe('change detection', () => {
    it('detects change when hash differs', () => {
      const result = detectChange('newhash', 'oldhash');
      expect(result.changed).toBe(true);
    });

    it('does not flag change when hash is same', () => {
      const result = detectChange('samehash', 'samehash');
      expect(result.changed).toBe(false);
    });

    it('returns isFirstRun: false when previousHash exists', () => {
      const result = detectChange('abc123', 'def456');
      expect(result.isFirstRun).toBe(false);
    });
  });

  describe('hash values in result', () => {
    it('includes current hash in result', () => {
      const result = detectChange('current', 'previous');
      expect(result.hash).toBe('current');
    });

    it('includes previous hash in result', () => {
      const result = detectChange('current', 'previous');
      expect(result.previousHash).toBe('previous');
    });

    it('has null previousHash on first run', () => {
      const result = detectChange('current', null);
      expect(result.previousHash).toBeNull();
    });
  });
});
