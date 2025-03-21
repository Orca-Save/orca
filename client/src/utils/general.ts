import { jwtDecode } from 'jwt-decode';
import { loginRequest } from './authConfig';

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

export function checkTokenExpiry() {
  const token = localStorage.getItem('accessToken');
  if (token) {
    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp > currentTime) {
      return true;
    }
  }
  localStorage.removeItem('accessToken');
  return false;
}

export async function refreshMsalAccessToken(instance: any, account: any) {
  try {
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    localStorage.setItem('accessToken', response.accessToken);
    return response.accessToken;
  } catch (error) {
    localStorage.removeItem('accessToken');
    throw error;
  }
}

export function newEndpoint(endpoint: string) {
  return process.env.REACT_APP_API_URL + endpoint;
}

export function apiFetch(
  endpoint: string,
  method: string,
  data?: any,
  stringify = true
) {
  const token = localStorage.getItem('accessToken');
  const body = stringify && data ? JSON.stringify(data) : data;
  const headers: any = {};
  headers['Content-Type'] = stringify
    ? 'application/json'
    : 'multipart/form-data';
  return fetch(process.env.REACT_APP_API_URL + endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    body,
  }).then((res) => res.json());
}
export const externalAccountId = 'faed4327-3a9c-4837-a337-c54e9704d60f';

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
