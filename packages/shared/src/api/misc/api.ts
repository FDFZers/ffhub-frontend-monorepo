import type { School } from "../user/types.ts";

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
  type: School | "other";
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
