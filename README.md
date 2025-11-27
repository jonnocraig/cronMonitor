# Cron Monitor

A lightweight website change detection system that sends push notifications when monitored web pages are updated. Designed to run as a cron job for periodic monitoring.

## Features

- **Change Detection** - Uses MD5 hashing to detect content changes between runs
- **Smart Normalization** - Filters out dynamic content (timestamps, tracking IDs, scripts) to reduce false positives
- **Push Notifications** - Sends alerts via [ntfy.sh](https://ntfy.sh) to mobile devices
- **Cron-Friendly** - Stateless execution with file-based persistence
- **Zero Dependencies on External Services** - Only requires ntfy.sh for notifications (free, no account needed)

## How It Works

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Fetch URL   │────▶│  Normalize  │────▶│  Hash (MD5)  │────▶│   Compare   │
└──────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
                                                                     │
                           ┌──────────────────────────────┬──────────┴──────────┐
                           │                              │                     │
                           ▼                              ▼                     ▼
                    ┌─────────────┐              ┌──────────────┐       ┌──────────────┐
                    │  First Run  │              │  No Change   │       │   Changed!   │
                    │ Store hash  │              │   (silent)   │       │   Notify 🔔  │
                    └─────────────┘              └──────────────┘       └──────────────┘
```

1. **Fetch** - Downloads the target webpage
2. **Normalize** - Strips scripts, styles, timestamps, and dynamic IDs
3. **Hash** - Computes MD5 hash of the cleaned content
4. **Compare** - Checks against the previously stored hash
5. **Notify** - Sends a push notification if changes are detected

## Prerequisites

- [Bun](https://bun.sh) or Node.js 18+
- A unique ntfy.sh topic name (used as a channel for notifications)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cron-monitor.git
cd cron-monitor

# Install dependencies
bun install
# or: npm install / pnpm install
```

## Configuration

Set the following environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONITOR_URL` | Yes | The URL to monitor (must be HTTP or HTTPS) |
| `NTFY_TOPIC` | Yes | Your unique ntfy.sh topic name |
| `FETCH_TIMEOUT_MS` | No | Request timeout in milliseconds (default: 30000) |

### Setting Up ntfy.sh Notifications

1. Install the [ntfy app](https://ntfy.sh) on your phone (iOS/Android)
2. Subscribe to a unique topic name (e.g., `my-monitor-abc123xyz`)
3. Use that same topic name in `NTFY_TOPIC`

> **Tip**: Use a random, hard-to-guess topic name since ntfy.sh topics are public by default.

## Usage

### One-Time Execution

```bash
MONITOR_URL="https://example.com/page" NTFY_TOPIC="my-topic" bun run src/index.ts
```

### Using a .env File

Create a `.env` file:

```bash
MONITOR_URL=https://example.com/page-to-watch
NTFY_TOPIC=my-unique-topic-name
```

Then run:

```bash
source .env && bun run src/index.ts
```

### Cron Job Setup

Monitor a page every hour:

```bash
# Edit crontab
crontab -e

# Add this line (runs every hour at minute 0)
0 * * * * cd /path/to/cron-monitor && source .env && bun run src/index.ts >> /var/log/cron-monitor.log 2>&1
```

Common cron schedules:

| Schedule | Cron Expression |
|----------|-----------------|
| Every hour | `0 * * * *` |
| Every 6 hours | `0 */6 * * *` |
| Daily at 9 AM | `0 9 * * *` |
| Every 15 minutes | `*/15 * * * *` |

## Project Structure

```
cron-monitor/
├── src/
│   ├── index.ts      # Entry point - validates env vars, runs monitor
│   ├── monitor.ts    # Core orchestration and change detection
│   ├── fetcher.ts    # HTTP client for fetching pages
│   ├── normalizer.ts # HTML normalization to reduce false positives
│   ├── hasher.ts     # MD5 hash computation
│   ├── notifier.ts   # ntfy.sh notification sender
│   └── state.ts      # Persistent state management (JSON file)
├── tests/
│   ├── hasher.test.ts
│   ├── normalizer.test.ts
│   └── monitor.test.ts
├── data/
│   └── state.json    # Auto-generated state file
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## State File

The monitor stores its state in `./data/state.json`:

```json
{
  "hash": "4cee772be5a20dc579beafc71f4f2ebc",
  "lastCheck": "2025-11-27T14:07:34.889Z",
  "url": "https://example.com"
}
```

This file is automatically created on the first run. Delete it to reset the baseline.

## HTML Normalization

To prevent false positives, the normalizer removes:

- `<script>` and `<noscript>` tags
- `<style>` tags and stylesheet links
- HTML comments
- CSRF tokens and tracking attributes
- Dynamic framework IDs (Vue `data-v-*`, Angular `ng-*`, React hash suffixes)
- Timestamps in various formats:
  - ISO 8601 (`2024-01-15T14:30:00Z`)
  - US dates (`01/15/2024`)
  - Times (`2:30 PM`)
  - Unix timestamps
  - Relative times (`5 minutes ago`, `Updated: yesterday`)
- Extra whitespace

This allows monitoring pages with dynamic elements without constant false alerts.

## Testing

```bash
# Run tests once
bun test

# Run tests in watch mode
bun run test:watch
```

## Example Output

**First run:**
```
[2025-11-27T16:00:00.000Z] Checking: https://example.com
First run - baseline hash stored: 4cee772be5a20dc579beafc71f4f2ebc
```

**No changes detected:**
```
[2025-11-27T17:00:00.000Z] Checking: https://example.com
No change detected (hash: 4cee772be5a20dc579beafc71f4f2ebc)
```

**Changes detected:**
```
[2025-11-27T18:00:00.000Z] Checking: https://example.com
CHANGE DETECTED!
  Previous hash: 4cee772be5a20dc579beafc71f4f2ebc
  Current hash:  a1b2c3d4e5f6789012345678abcdef01
  Notification sent to topic: my-topic
```

## Use Cases

- Monitor product pages for price drops or availability
- Track documentation pages for updates
- Watch competitor websites for changes
- Get notified when job listings are posted
- Monitor government/regulatory pages for policy changes

## License

MIT
