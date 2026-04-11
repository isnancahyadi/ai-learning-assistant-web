import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { createAuthRefresh } from "axios-auth-refresh";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { isServer } from "solid-js/web";

import type { RefreshTokenType } from "~/types/schema";
import type { RefreshTokenPostType } from "~/types/validations";

import { API_AUTH } from "./api-prefix";
import cookie, { type CookieOptions } from "./cookies";
import { env } from "./env";

dayjs.extend(utc);
dayjs.extend(timezone);

export const http = axios.create({
  baseURL: env.API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
  },
  timeout: 30000,
});

const injectToken = async (config: InternalAxiosRequestConfig) => {
  const token = cookie.getCookie("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

http.interceptors.request.use(injectToken, (error) => Promise.reject(error));

const refreshAuthLogic = async (request: InternalAxiosRequestConfig) => {
  const refreshToken = cookie.getCookie("refresh_token");

  if (!refreshToken) {
    return Promise.reject(request);
  }

  try {
    const response = await axios.post<RefreshTokenPostType, AxiosResponse<RefreshTokenType>>(`${API_AUTH}/refresh-token`, { refresh_token: refreshToken });

    const { token: newAccessToken, refresh_token: newRefreshToken, exp, exp_refresh_token } = response.data;

    const cookieOpts: CookieOptions = {
      secure: import.meta.env.PROD ?? false,
      path: "/",
    };

    cookie.setCookie({
      name: "token",
      value: newAccessToken,
      option: {
        ...cookieOpts,
        expires: dayjs(exp).toDate(),
      },
    });

    cookie.setCookie({
      name: "refresh_token",
      value: newRefreshToken,
      option: {
        ...cookieOpts,
        expires: dayjs(exp_refresh_token).toDate(),
      },
    });

    request.headers.Authorization = `Bearer ${newAccessToken}`;

    return Promise.resolve();
  } catch (error) {
    cookie.deleteCookie(["token", "refresh_token"]);

    if (!isServer) {
      localStorage.clear();
      window.location.href = "/auth/request-login";
    }

    return Promise.reject(error);
  }
};

createAuthRefresh(http, refreshAuthLogic, {
  statusCodes: [401],
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
);

export const api = {
  get: <T = unknown, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> => http.get<T, R>(url, config).then((res) => res),
  post: <T = unknown, D = unknown, R = AxiosResponse<D>>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> => http.post<T, R>(url, data, config).then((res) => res),
  put: <T = unknown, D = unknown, R = AxiosResponse<D>>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> => http.put<T, R>(url, data, config).then((res) => res),
  patch: <T = unknown, R = AxiosResponse<T>>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> => http.patch<T, R>(url, data, config).then((res) => res),
  delete: <T = unknown, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> => http.delete<T, R>(url, config).then((res) => res),
};
