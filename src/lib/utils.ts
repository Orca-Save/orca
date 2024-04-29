import { Decimal } from "@prisma/client/runtime/index-browser.js";
import { FormInstance } from "antd";
import { clsx, type ClassValue } from "clsx";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { twMerge } from "tailwind-merge";
import { FieldErrors } from "./goals";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = (
  value?: string | number | Decimal,
  includeDollar?: boolean
) => {
  if (!value) return "";
  if (isNaN(Number(value))) return "";
  const precision = String(Number(value)).split(".")?.[1]?.length;
  const currentPrecision = precision > 0 ? Math.min(precision, 2) : 0;
  const valueString = String(Number(value).toFixed(currentPrecision)).replace(
    /^-/,
    ""
  );
  const formattedValue = valueString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const dollarSign = includeDollar ? "" : "$";
  return `${Number(value) < 0 ? "-" : ""}${dollarSign}${formattedValue}`;
};

export const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://orca-next.azurewebsites.net";

export const navigateBack = (router: AppRouterInstance) => {
  const previousPath = sessionStorage.getItem("previousPath");
  const currentPath = window.location.pathname;

  if (previousPath && previousPath !== currentPath) {
    router.back();
  } else {
    router.push("/goals");
  }
};

export function getPrevPageHref(referer: string | undefined, window: Window) {
  if (!referer) return "/";
  const prevURL = new URL(referer);
  console.log(prevURL, window.location);
  console.log(prevURL.pathname, window.location.pathname);
  return prevURL.origin !== window.location.origin ||
    prevURL.pathname === window.location.pathname
    ? "/"
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
