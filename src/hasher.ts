import { createHash } from 'node:crypto';

/**
 * Computes an MD5 hash of the given content.
 * @param content - The string content to hash
 * @returns A 32-character hexadecimal hash string
 */
export function computeMd5(content: string): string {
  return createHash('md5').update(content, 'utf8').digest('hex');
}
