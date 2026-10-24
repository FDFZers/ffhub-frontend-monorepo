import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { toast } from "@heroui/react";
import axios from "axios";

import { useUserStore } from "../stores/user.ts";
import { readAccessToken } from "./token.ts";
import { API_AUTH_INTERNAL, ApiError, type ApiErrorInfo } from "./types.ts";

export const client: AxiosInstance = axios.create({
  withCredentials: true,
});

function toApiError(error: AxiosError): ApiError {
  if (!error.response) {
    return new ApiError({ error: "client_error", details: ["网络错误", error.message] }, 0);
  }

  const status = error.response.status;
  const data = error.response.data;

  if (data && typeof data === "object" && "error" in data) {
    return new ApiError(data as ApiErrorInfo, status);
  }

  return new ApiError(
    {
      error: "unknown",
      details: [`响应码：${status}`, "未知错误"],
    },
    status,
  );
}

let refreshPromise: Promise<void> | null = null;

function refreshAccessToken(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = client
    .post(API_AUTH_INTERNAL + "/auth/refresh", null, { skipRefresh: true })
    .then(async () => {
      try {
        await useUserStore.getState().syncClaims();
      } catch (e) {
        console.error("[FFHub API] 令牌校验失败", e);
        toast.danger("令牌校验失败");
      }
    })
    .catch((error: AxiosError) => {
      if (error.config?.logoutIfTokenExpired == true) useUserStore.getState().clear();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function shouldAttemptRefresh(
  apiError: ApiError,
  config: InternalAxiosRequestConfig | undefined,
): boolean {
  if (!config) return false;
  if (config._retried || config.skipRefresh) return false;
  if (apiError.status !== 401) return false;
  if (apiError.code !== "token_expired") return false;

  return true;
}

function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    const withToken = config.withToken ?? true;
    if (withToken) {
      const token = readAccessToken();
      if (token) {
        if (config.headers instanceof axios.AxiosHeaders) {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else if (config.headers) {
          (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        } else {
          config.headers = { Authorization: `Bearer ${token}` } as never;
        }
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const apiError = toApiError(error);
      const config = error.config;

      if (!shouldAttemptRefresh(apiError, config)) {
        return Promise.reject(apiError);
      }

      try {
        console.log("[FFHub API] 令牌过期，刷新令牌中...");
        await refreshAccessToken();
      } catch {
        return Promise.reject(apiError);
      }

      config!._retried = true;
      return client.request(config!);
    },
  );
}

setupInterceptors(client);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await client.request<T>(config);
  return response.data;
}
