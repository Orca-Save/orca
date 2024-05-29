import { FormInstance } from 'antd';
import { clsx, type ClassValue } from 'clsx';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { twMerge } from 'tailwind-merge';
import { FieldErrors } from './goals';

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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = (
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
  const dollarSign = includeDollar ? '' : '$';
  return `${Number(value) < 0 ? '-' : ''}${dollarSign}${formattedValue}`;
};

export const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://orca-next.azurewebsites.net';

export const navigateBack = (router: AppRouterInstance) => {
  const previousPath = sessionStorage.getItem('previousPath');
  const currentPath = window.location.pathname;

  if (previousPath && previousPath !== currentPath) {
    router.back();
  } else {
    router.push('/goals');
  }
};

export function getPrevPageHref(referer: string | undefined, window: Window) {
  if (!referer) return '/';
  const prevURL = new URL(referer);
  return prevURL.origin !== window.location.origin ||
    prevURL.pathname === window.location.pathname
    ? '/'
    : prevURL.pathname;
}

export function applyFormErrors(form: FormInstance, result: FieldErrors) {
  Object.entries(result.fieldErrors).forEach(([field, errors]) => {
    errors.forEach((error) => {
      form.setFields([
        {
          name: field,
          errors: [error],
        },
      ]);
    });
  });
}
