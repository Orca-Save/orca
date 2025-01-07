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

export function apiFetch(endpoint: string, method: string, body?: any) {
  const token = localStorage.getItem('accessToken');
  return fetch(process.env.REACT_APP_API_URL + endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json());
}
export const externalAccountId = 'faed4327-3a9c-4837-a337-c54e9704d60f';

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
