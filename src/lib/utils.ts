import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = (
  value?: string | number,
  includeDollar?: boolean
) =>
  `${includeDollar ? "" : "$"}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
