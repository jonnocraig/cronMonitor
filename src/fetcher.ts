/**
 * Fetches a web page with timeout support.
 *
 * @param url - The URL to fetch
 * @param timeoutMs - Timeout in milliseconds (default: 30000)
 * @returns The HTML content of the page
 * @throws Error if the fetch fails or times out
 */
export async function fetchPage(url: string, timeoutMs = 30000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WebsiteMonitor/1.0 (https://github.com/user/cron-monitor)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
    throw new Error('Unknown fetch error');
  } finally {
    clearTimeout(timeoutId);
  }
}
