export const API_STUDENT_ID = import.meta.env.DEV
  ? new URL("/api/student_id/v1/", location.origin).toString()
  : "https://student-id.fdfz.top/api/v1/";
export const API_STUDENT_ID_INTERNAL = import.meta.env.DEV
  ? new URL("/api/student_id/internal/", location.origin).toString()
  : "https://student-id.fdfz.top/api/internal/";

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
  altcha_error: "人机验证失败",
  code_not_detected: "未识别到验证码",
  password_reset_required: "需要重设密码",
  client_error: "客户端错误",
  unknown: "未知错误",
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
