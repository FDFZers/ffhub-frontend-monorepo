import type {
  BindingsResponse,
  ChangePasswordRequest,
  QQBindInitResponse,
  SessionListResponse,
  TOTPBindInitResponse,
} from "./types.ts";

import { request } from "../api.ts";
import { API_STUDENT_ID_INTERNAL } from "../types.ts";

// ---------------------------------------------------------------------------
// 绑定信息
// ---------------------------------------------------------------------------

/** 查询当前账号已绑定的邮箱、QQ 与 TOTP 状态。 */
export function getBindings(): Promise<BindingsResponse> {
  return request<BindingsResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/binding",
  });
}

// ---------------------------------------------------------------------------
// 登录会话
// ---------------------------------------------------------------------------

export function listSessions(): Promise<SessionListResponse> {
  return request<SessionListResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/session",
  });
}

/** 撤销单个会话；撤销当前会话时会同时清理 Cookie。 */
export async function revokeSession(sessionID: string): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/security/session/${encodeURIComponent(sessionID)}`,
  });
}

/** 撤销全部会话与提权令牌；调用后需要重新登录。 */
export async function revokeAllSessions(): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/session",
  });
}

// ---------------------------------------------------------------------------
// 密码
// ---------------------------------------------------------------------------

export async function changePassword(body: ChangePasswordRequest): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/password/change",
    data: body,
  });
}

// ---------------------------------------------------------------------------
// 邮箱绑定
// ---------------------------------------------------------------------------

export async function bindEmailInit(email: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/email/init",
    data: { email },
  });
}

export async function bindEmailVerify(email: string, code: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/email/verify",
    data: { email, code },
  });
}

export async function unbindEmail(): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/email",
  });
}

// ---------------------------------------------------------------------------
// QQ 绑定
// ---------------------------------------------------------------------------

/** 发起 QQ 绑定；返回的验证码需要由待绑定 QQ 私聊发送给机器人。 */
export function bindQQInit(qq: string): Promise<QQBindInitResponse> {
  return request<QQBindInitResponse>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/qq/init",
    data: { qq },
  });
}

/** 轮询校验 QQ 绑定；未识别到验证码时后端返回 403，可继续轮询。 */
export async function bindQQVerify(qq: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/qq/verify",
    data: { qq },
  });
}

export async function unbindQQ(): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/qq",
  });
}

// ---------------------------------------------------------------------------
// TOTP 绑定
// ---------------------------------------------------------------------------

export function bindTOTPInit(): Promise<TOTPBindInitResponse> {
  return request<TOTPBindInitResponse>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/totp/init",
  });
}

export async function bindTOTPVerify(code: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/totp/verify",
    data: { code },
  });
}

export async function unbindTOTP(): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/totp",
  });
}
