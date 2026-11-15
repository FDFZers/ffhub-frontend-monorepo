import type { SearchInfo, SearchRequest, SearchResponse } from "../search/types.ts";
import type {
  AppAuthStatus,
  AppClientType,
  AppInfo,
  AppStatus,
  AuthorizationInfo,
} from "./types.ts";

import { request } from "../api.ts";
import { API_STUDENT_ID, API_STUDENT_ID_INTERNAL } from "../types.ts";

// ---------------------------------------------------------------------------
// 搜索与详情
// ---------------------------------------------------------------------------

export function getAppSearchInfo(): Promise<SearchInfo> {
  return request<SearchInfo>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/app/search/info",
  });
}

export function searchApps(body: SearchRequest): Promise<SearchResponse<AppInfo>> {
  return request<SearchResponse<AppInfo>>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/app/search/query",
    data: body,
  });
}

export function getApp(appID: number): Promise<AppInfo> {
  return request<AppInfo>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/app/${appID}`,
  });
}

// ---------------------------------------------------------------------------
// 创建与修改
// ---------------------------------------------------------------------------

export interface CreateAppRequest {
  namespace: string;
  name: string;
  owner_user_id: number;
}

export function createApp(body: CreateAppRequest): Promise<AppInfo> {
  return request<AppInfo>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/app",
    data: body,
  });
}

export interface UpdateAppRequest {
  namespace?: string;
  owner_user_id?: number;
  name?: string;
  description?: string;
  homepage_url?: string;
  client_type?: AppClientType;
  redirect_uris?: string[];
  requested_perms?: string[];
}

export function updateApp(appID: number, body: UpdateAppRequest): Promise<AppInfo> {
  return request<AppInfo>({
    method: "PATCH",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/app/${appID}`,
    data: body,
  });
}

export function setAppStatus(appID: number, status: AppStatus): Promise<AppInfo> {
  return request<AppInfo>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/app/${appID}/${status === "suspended" ? "suspend" : "activate"}`,
  });
}

export async function deleteApp(appID: number): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/app/${appID}`,
  });
}

/** 重置 confidential 客户端密钥；明文密钥只会在该响应中返回一次。 */
export function rotateAppSecret(appID: number): Promise<{ client_secret: string }> {
  return request<{ client_secret: string }>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/app/${appID}/secret/rotate`,
  });
}

// ---------------------------------------------------------------------------
// 图标
// ---------------------------------------------------------------------------

/**
 * 应用图标通过固定接口 GET /api/v1/app/:appID/icon 获取。
 * 后端只返回 302 跳转，不再在应用对象中提供 icon_path，也不需要 cacheBust 查询参数。
 */
export function appIconURL(appID: number): string {
  return new URL(`app/${appID}/icon`, API_STUDENT_ID).toString();
}

export async function uploadAppIcon(appID: number, file: File): Promise<AppInfo> {
  const form = new FormData();
  form.append("icon", file);
  return request<AppInfo>({
    method: "PUT",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/app/${appID}/icon`,
    data: form,
    timeout: 60_000,
  });
}

export async function deleteAppIcon(appID: number): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/app/${appID}/icon`,
  });
}

// ---------------------------------------------------------------------------
// 授权记录
// ---------------------------------------------------------------------------

export interface AuthorizationListResponse {
  authorizations: AuthorizationInfo[];
}

/** userID 省略时查询自己的授权；查询他人需要 oauths.read 权限。 */
export function listAuthorizations(userID?: number): Promise<AuthorizationListResponse> {
  return request<AuthorizationListResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: userID === undefined ? "/app/authorizations" : `/app/authorizations/${userID}`,
  });
}

export async function revokeAuthorization(authID: number): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/app/authorizations/${authID}`,
  });
}

export function appStatusLabel(status: AppStatus): string {
  return status === "active" ? "正常" : "已停用";
}

export function appAuthStatusLabel(status: AppAuthStatus): string {
  return status === "active" ? "生效中" : "需重新授权";
}

export function appClientTypeLabel(type: AppClientType): string {
  switch (type) {
    case "confidential":
      return "机密客户端";
    case "public":
      return "公开客户端";
    case "confidential_device":
      return "机密设备客户端";
    case "public_device":
      return "公开设备客户端";
  }
}
