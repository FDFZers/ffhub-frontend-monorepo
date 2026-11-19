import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { toast } from "@heroui/react";
import axios from "axios";

import { useUserStore } from "../stores/user.ts";
import { clearSessionHint, markSessionHint, readAccessToken } from "./token.ts";
import { API_STUDENT_ID, API_STUDENT_ID_INTERNAL, ApiError, type ApiErrorInfo } from "./types.ts";

declare module "axios" {
  export interface AxiosRequestConfig {
    withToken?: boolean;
    logoutIfTokenExpired?: boolean;
    skipRefresh?: boolean;
    _retried?: boolean;
  }
}

export const client: AxiosInstance = axios.create({
  withCredentials: true,
  // 避免网络异常时请求永久挂起（例如启动时刷新会话、校园网 IP 检测）。
  timeout: 60_000,
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

function refreshAccessToken(logoutIfTokenExpired: boolean): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = client
    .post("/auth/refresh", null, {
      baseURL: API_STUDENT_ID_INTERNAL,
      withToken: false,
      skipRefresh: true,
    })
    .then(async () => {
      markSessionHint();
      try {
        await useUserStore.getState().syncClaims();
      } catch (e) {
        console.error("[FFHub API] 令牌校验失败", e);
        toast.danger("令牌校验失败");
      }
    })
    .catch((error: AxiosError) => {
      // 刷新接口返回 401 说明会话已失效，清掉本地提示，避免下次启动再探测。
      if (error.response?.status === 401) clearSessionHint();
      if (logoutIfTokenExpired) useUserStore.getState().clear();
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
  // invalid_token 也尝试刷新：令牌结构升级（如权限改存 ID）会让旧令牌解析失败，
  // 此时用 session_token 换发新令牌即可恢复，无需用户重新登录。
  if (apiError.code !== "token_expired" && apiError.code !== "invalid_token") return false;

  return true;
}

function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    // 对外接口 /api/v1 的 CORS 使用 AllowAllOrigins（响应头为 *），浏览器会拒绝
    // 携带 Cookie 的跨域请求，因此公开接口一律不发送凭据。
    if (config.baseURL === API_STUDENT_ID) {
      config.withCredentials = false;
    }

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
        console.log("[FFHub API] 令牌过期，刷新令牌中…");
        await refreshAccessToken(config?.logoutIfTokenExpired === true);
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
