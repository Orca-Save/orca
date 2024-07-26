export function sendSlackMessage(message: string) {
  if (!process.env.SLACK_WEBHOOK_URL)
    return Promise.resolve(console.log('No Slack webhook URL found'));
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  return fetch(slackWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: message }),
  });
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.BASE_URL;

export function getPrevPageHref(referer: string | undefined, window: Window) {
  if (!referer) return '/';
  const prevURL = new URL(referer);
  return prevURL.origin !== window.location.origin ||
    prevURL.pathname === window.location.pathname
    ? '/'
    : prevURL.pathname;
}
