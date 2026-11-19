import type {
  AuthorizationDecisionResponse,
  AuthorizationPreview,
  DeviceAuthorizationPreview,
} from "./types.ts";

import { request } from "../api.ts";
import { API_STUDENT_ID } from "../types.ts";

export interface AuthorizePreviewParams {
  client_id: string;
  redirect_uri?: string;
  state?: string;
  code_challenge?: string;
}

/** 获取 OAuth 授权确认页预览；权限固定取自应用登记值，不再由请求参数指定。 */
export function getAuthorizePreview(params: AuthorizePreviewParams): Promise<AuthorizationPreview> {
  const query = new URLSearchParams();
  query.set("client_id", params.client_id);
  if (params.redirect_uri) query.set("redirect_uri", params.redirect_uri);
  if (params.state) query.set("state", params.state);
  if (params.code_challenge) query.set("code_challenge", params.code_challenge);

  return request<AuthorizationPreview>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: "/oauth/authorize",
    params: query,
  });
}

export function decideAuthorization(body: {
  request_id: string;
  approve: boolean;
}): Promise<AuthorizationDecisionResponse> {
  return request<AuthorizationDecisionResponse>({
    method: "POST",
    baseURL: API_STUDENT_ID,
    url: "/oauth/authorize",
    data: body,
  });
}

export function getDevicePreview(userCode: string): Promise<DeviceAuthorizationPreview> {
  return request<DeviceAuthorizationPreview>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: "/oauth/device",
    params: { user_code: userCode },
  });
}

export async function decideDevice(body: { user_code: string; approve: boolean }): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID,
    url: "/oauth/device/approve",
    data: body,
  });
}
