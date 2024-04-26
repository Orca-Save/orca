import { Decimal } from "@prisma/client/runtime/index-browser.js";
import { clsx, type ClassValue } from "clsx";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = (
  value?: string | number | Decimal,
  includeDollar?: boolean
): string => {
  if (value === undefined) {
    return "";
  }

  let numericValue = typeof value === "string" ? parseFloat(value) : value;
  numericValue =
    numericValue instanceof Decimal ? numericValue.toNumber() : numericValue;
  if (isNaN(numericValue)) {
    return "";
  }

  const valueString = numericValue.toFixed(0).replace(/^-/, "");
  const formattedValue = valueString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const dollarSign = includeDollar ? "" : "$";
  return `${numericValue < 0 ? "-" : ""}${dollarSign}${formattedValue}`;
};

export const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://orca-next.azurewebsites.net";

export const navigateBack = (router: AppRouterInstance) => {
  const previousPath = sessionStorage.getItem("previousPath");
  console.log("previousPath", previousPath);
  const currentPath = window.location.pathname;

  if (previousPath && previousPath !== currentPath) {
    router.back();
  } else {
    router.push("/goals");
  }
};
