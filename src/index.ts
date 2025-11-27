import { runMonitor } from './monitor.js';

/**
 * Website Change Monitor
 *
 * A cron job script that monitors a website for changes.
 * It computes an MD5 hash of the normalized HTML content and
 * compares it with the previous run. If changes are detected,
 * a push notification is sent via ntfy.sh.
 *
 * Environment Variables:
 *   MONITOR_URL  - Required: The URL to monitor
 *   NTFY_TOPIC   - Required: The ntfy.sh topic for notifications
 *   FETCH_TIMEOUT_MS - Optional: Fetch timeout in ms (default: 30000)
 *
 * Usage:
 *   MONITOR_URL=https://example.com NTFY_TOPIC=my-topic bun run src/index.ts
 */

async function main(): Promise<void> {
  // Load configuration from environment variables
  const url = process.env.MONITOR_URL;
  const topic = process.env.NTFY_TOPIC;
  const timeoutMs = process.env.FETCH_TIMEOUT_MS
    ? parseInt(process.env.FETCH_TIMEOUT_MS, 10)
    : undefined;

  // Validate required environment variables
  if (!url) {
    console.error('Error: MONITOR_URL environment variable is required');
    console.error('Usage: MONITOR_URL=https://example.com NTFY_TOPIC=my-topic bun run src/index.ts');
    process.exit(1);
  }

  if (!topic) {
    console.error('Error: NTFY_TOPIC environment variable is required');
    console.error('Usage: MONITOR_URL=https://example.com NTFY_TOPIC=my-topic bun run src/index.ts');
    process.exit(1);
  }

  // Validate URL format
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('URL must use HTTP or HTTPS protocol');
    }
  } catch (error) {
    console.error(`Error: Invalid URL "${url}"`);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }

  console.log(`[${new Date().toISOString()}] Checking: ${url}`);

  try {
    const result = await runMonitor(url, topic, timeoutMs);

    if (result.isFirstRun) {
      console.log(`First run - baseline hash stored: ${result.hash.substring(0, 8)}...`);
    } else if (result.changed) {
      console.log(`CHANGE DETECTED!`);
      console.log(`  Previous hash: ${result.previousHash?.substring(0, 8)}...`);
      console.log(`  Current hash:  ${result.hash.substring(0, 8)}...`);
      console.log(`  Notification sent to topic: ${topic}`);
    } else {
      console.log(`No change detected (hash: ${result.hash.substring(0, 8)}...)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Monitor failed:');
    if (error instanceof Error) {
      console.error(`  ${error.message}`);
    } else {
      console.error('  Unknown error');
    }
    process.exit(1);
  }
}

// Run the main function
main();
