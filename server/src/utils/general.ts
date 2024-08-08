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
