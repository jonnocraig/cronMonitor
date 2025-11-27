import { fetchPage } from './fetcher.js';
import { normalizeHtml } from './normalizer.js';
import { computeMd5 } from './hasher.js';
import { loadState, saveState } from './state.js';
import { sendNotification } from './notifier.js';

/**
 * Result of a monitoring run
 */
export interface MonitorResult {
  /** Whether a change was detected */
  changed: boolean;
  /** The current hash of the page */
  hash: string;
  /** The previous hash (null on first run) */
  previousHash: string | null;
  /** Whether this is the first run */
  isFirstRun: boolean;
}

/**
 * Pure function that detects changes between current and previous hash.
 * This is the core logic, separated for easy testing.
 *
 * @param currentHash - The current hash of the page
 * @param previousHash - The previous hash (null if first run)
 * @returns MonitorResult with change detection results
 */
export function detectChange(currentHash: string, previousHash: string | null): MonitorResult {
  const isFirstRun = previousHash === null;
  const changed = !isFirstRun && previousHash !== currentHash;

  return {
    changed,
    hash: currentHash,
    previousHash,
    isFirstRun,
  };
}

/**
 * Runs the website monitor.
 *
 * This function:
 * 1. Fetches the target URL
 * 2. Normalizes the HTML to remove dynamic content
 * 3. Computes an MD5 hash of the normalized content
 * 4. Compares with the previous hash
 * 5. Sends a notification if a change is detected
 * 6. Saves the current hash for the next run
 *
 * @param url - The URL to monitor
 * @param ntfyTopic - The ntfy.sh topic for notifications
 * @param timeoutMs - Optional fetch timeout in milliseconds
 * @returns MonitorResult with the results of the monitoring run
 */
export async function runMonitor(
  url: string,
  ntfyTopic: string,
  timeoutMs?: number
): Promise<MonitorResult> {
  // 1. Fetch the page
  const html = await fetchPage(url, timeoutMs);

  // 2. Normalize HTML (remove dynamic content)
  const normalized = normalizeHtml(html);

  // 3. Compute MD5 hash
  const currentHash = computeMd5(normalized);

  // 4. Load previous hash
  const previousHash = loadState();

  // 5. Detect changes
  const result = detectChange(currentHash, previousHash);

  // 6. Send notification if changed
  if (result.changed) {
    await sendNotification(ntfyTopic, url);
  }

  // 7. Save current hash for next run
  saveState(currentHash, url);

  return result;
}
