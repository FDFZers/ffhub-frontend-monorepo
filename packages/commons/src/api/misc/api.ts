import type { School } from "../user/types.ts";

import { request } from "../api.ts";
import { API_AUTH } from "../types.ts";

export interface VersionResponse {
  commit: string;
  build_time: string;
  is_prod: boolean;
}

export function getVersion(): Promise<VersionResponse> {
  return request<VersionResponse>({
    method: "GET",
    baseURL: API_AUTH,
    url: "/version",
  });
}

export interface IPInfoResponse {
  ip: string;
  type: School | "other";
}

export function getIPInfo(): Promise<IPInfoResponse> {
  return request<IPInfoResponse>({
    method: "GET",
    baseURL: API_AUTH,
    url: "/ipinfo",
  });
}
