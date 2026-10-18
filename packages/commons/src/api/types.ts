declare module "axios" {
  export interface AxiosRequestConfig {
    withToken?: boolean;
    logoutIfTokenExpired?: boolean;
    skipRefresh?: boolean;
    _retried?: boolean;
  }
}

export const API_AUTH = import.meta.env.DEV
  ? new URL("/api/user/v1/", location.origin).toString()
  : "https://auth.fdfz.top/api/v1/";
export const API_AUTH_INTERNAL = import.meta.env.DEV
  ? new URL("/api/user/internal/", location.origin).toString()
  : "https://auth.fdfz.top/api/internal/";

export const ACCESS_TOKEN_KEY = "access_token";

export const ERROR_MESSAGES: Record<string, string> = {
  internal_error: "内部错误",
  bad_request: "请求错误",
  illegal_state: "非法状态",
  request_too_large: "请求体过大",
  rate_limit_exceeded: "请求过于频繁",
  forbidden: "禁止访问",
  invalid_token: "无效令牌",
  token_expired: "令牌已过期",
  permission_denied: "权限不足",
  unsupported_media_type: "不支持的媒体类型",
  not_found: "未找到",
  conflict: "冲突",
};

export interface ApiErrorInfo {
  error: string;
  details?: string[];
}

export class ApiError extends Error {
  readonly code: string;
  readonly details: string[];
  readonly status?: number;

  constructor(info: ApiErrorInfo, status?: number) {
    super(ERROR_MESSAGES[info.error] + "：" + (info.details ?? []).join(" // "));
    this.name = "ApiError";
    this.code = info.error;
    this.details = info.details ?? [];
    this.status = status;
  }
}
