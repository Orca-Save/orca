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

const formatters: { [currency: string]: Intl.NumberFormat } = {
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }),
};

export const currencyFormatter2 = (
  value?: string | number,
  includeDollar?: boolean
) => {
  if (!value && value !== 0) return '';
  if (isNaN(Number(value))) return '';
  const precision = String(Number(value)).split('.')?.[1]?.length;
  const currentPrecision = precision > 0 ? Math.min(precision, 2) : 0;
  const valueString = String(Number(value).toFixed(currentPrecision)).replace(
    /^-/,
    ''
  );
  const formattedValue = valueString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const dollarSign = includeDollar ? '$' : '';
  return `${Number(value) < 0 ? '-' : ''}${dollarSign}${formattedValue}`;
};

export const currencyFormatter = (
  amount: number | string,
  currencyCode?: string,
  alwaysPositive?: boolean
) => {
  try {
    if (typeof amount === 'undefined' || amount === null) {
      return '';
    }

    let numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      return '';
    }

    if (alwaysPositive) {
      numericAmount = Math.abs(numericAmount);
    }

    if (!formatters[currencyCode!]) {
      formatters[currencyCode!] = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    }

    return formatters[currencyCode!].format(numericAmount);
  } catch (error) {
    console.error(error);
    return amount.toString();
  }
};

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
