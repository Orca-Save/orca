import { FormInstance } from 'antd';
import { clsx, type ClassValue } from 'clsx';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { twMerge } from 'tailwind-merge';
import { FieldErrors } from './goals';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatters: { [currency: string]: Intl.NumberFormat } = {
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }),
};

export const currencyFormatter = (
  amount: number | string,
  currencyCode?: string
) => {
  try {
    if (typeof amount === 'undefined' || amount === null) {
      return '';
    }

    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      return '';
    }

    if (!formatters[currencyCode!]) {
      formatters[currencyCode!] = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    }

    return formatters[currencyCode!].format(numericAmount);
  } catch (error) {
    console.log(error);
    return amount.toString();
  }
};

export const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.BASE_URL;

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
