/**
 * Sends a push notification via ntfy.sh.
 *
 * ntfy.sh is a free, open-source notification service.
 * Users subscribe to topics via the ntfy app (iOS/Android)
 * and receive push notifications when messages are published.
 *
 * @param topic - The ntfy.sh topic to publish to
 * @param url - The URL that changed (included in notification)
 * @throws Error if the notification fails to send
 */
export async function sendNotification(topic: string, url: string): Promise<void> {
  const ntfyUrl = `https://ntfy.sh/${topic}`;

  const response = await fetch(ntfyUrl, {
    method: 'POST',
    headers: {
      'Title': 'Website Changed!',
      'Priority': 'high',
      'Tags': 'rotating_light,bell',
      'Click': url,
      'Actions': `view, Open Website, ${url}`,
    },
    body: `The monitored page has been updated. Tap to view or use the button below.`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notification failed: HTTP ${response.status} - ${errorText}`);
  }
}

/**
 * Sends a test notification to verify the setup.
 *
 * @param topic - The ntfy.sh topic to test
 * @throws Error if the notification fails
 */
export async function sendTestNotification(topic: string): Promise<void> {
  const ntfyUrl = `https://ntfy.sh/${topic}`;

  const response = await fetch(ntfyUrl, {
    method: 'POST',
    headers: {
      'Title': 'Test Notification',
      'Priority': 'default',
      'Tags': 'white_check_mark',
    },
    body: 'Your website monitor is configured correctly!',
  });

  if (!response.ok) {
    throw new Error(`Test notification failed: HTTP ${response.status}`);
  }
}
