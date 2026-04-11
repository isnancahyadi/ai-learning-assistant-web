import Cookies from "js-cookie";
import { getRequestEvent, isServer } from "solid-js/web";

import { env } from "./env";

export type CookieOptions = Cookies.CookieAttributes;

const getCookiesName = (name: string) => `${env.APP_ENV}_${env.PROJECT_NAME}_${name}`;

const parseCookieString = (options: { cookieString: string; key: string }): string | undefined => {
  const match = options.cookieString.match(new RegExp(`(^| )${options.key}=([^;]+)`));
  if (match) return decodeURIComponent(match[2]);
  return undefined;
};

const setCookie = <T>(data: { name: string; value: T; option?: CookieOptions }) => {
  if (isServer) {
    console.warn("cookie may not be sent without manual configuration Response Header");
    return;
  }

  Cookies.set(getCookiesName(data.name), JSON.stringify(data.value), data.option);
};

const getCookie = <T>(name: string): T | undefined => {
  const key = getCookiesName(name);

  if (isServer) {
    try {
      const event = getRequestEvent();
      const cookieHeader = event?.request.headers.get("cookie");

      if (cookieHeader) {
        const rawValue = parseCookieString({ cookieString: cookieHeader, key });
        return rawValue ? (JSON.parse(rawValue) as T) : undefined;
      }
    } catch {
      console.error("Error reading cookie on server");
      return undefined;
    }
    return undefined;
  }

  const value = Cookies.get(key);
  return value ? (JSON.parse(value) as T) : undefined;
};

const deleteCookie = (names: Array<string>) => {
  if (isServer) return;

  names.forEach((name) => {
    Cookies.remove(getCookiesName(name));
  });
};

const cookie = {
  getCookiesName,
  setCookie,
  getCookie,
  deleteCookie,
};

export default cookie;
