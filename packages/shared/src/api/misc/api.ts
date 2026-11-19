import { request } from "../api.ts";
import { API_STUDENT_ID } from "../types.ts";

export interface VersionResponse {
  commit: string;
  build_time: string;
  is_prod: boolean;
}

export function getVersion(): Promise<VersionResponse> {
  return request<VersionResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: "/version",
    withToken: false,
  });
}

export interface IPInfoResponse {
  ip: string;
  /** 后端配置的校园网展示文本；null 表示不在校园网。 */
  type: string | null;
}

export function getIPInfo(): Promise<IPInfoResponse> {
  return request<IPInfoResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: "/ipinfo",
    withToken: false,
    // 仅用于登录页判断是否处于校园网，超时后按普通网络处理即可。
    timeout: 5_000,
  });
}
