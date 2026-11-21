import type {
  BindingEmailResponse,
  BindingQQResponse,
  BindingsResponse,
  BindingsStatusResponse,
  ChangePasswordRequest,
  QQBindInitResponse,
  SessionListResponse,
  TOTPBindInitResponse,
  TwoFactorSettingResponse,
  UpdateTwoFactorRequest,
} from "./types.ts";

import { request } from "../api.ts";
import { API_STUDENT_ID, API_STUDENT_ID_INTERNAL } from "../types.ts";

// ---------------------------------------------------------------------------
// 绑定信息
// ---------------------------------------------------------------------------

/** 查询当前账号各类二次验证方式的绑定状态。 */
export function getBindingsStatus(): Promise<BindingsStatusResponse> {
  return request<BindingsStatusResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: "/security/binding/status",
  });
}

/** 查询当前账号已绑定的邮箱；需要 binding.read.email 权限。 */
export function getBindingEmail(): Promise<BindingEmailResponse> {
  return request<BindingEmailResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: "/security/binding/email",
  });
}

/** 查询当前账号已绑定的 QQ；需要 binding.read.qq 权限。 */
export function getBindingQQ(): Promise<BindingQQResponse> {
  return request<BindingQQResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: "/security/binding/qq",
  });
}

/**
 * 查询当前账号的绑定信息。
 * 后端把绑定状态与绑定值拆成三个接口：状态决定「是否已绑定」，值需要额外权限才能读取，
 * 因此绑定值读取失败时只降级为 null，不影响绑定状态的展示。
 */
export async function getBindings(): Promise<BindingsResponse> {
  const [status, email, qq] = await Promise.all([
    getBindingsStatus(),
    getBindingEmail().catch(() => null),
    getBindingQQ().catch(() => null),
  ]);

  return {
    email: { bound: status.email, value: email?.email ?? null },
    qq: { bound: status.qq, value: qq?.qq ?? null },
    totp: status.totp,
  };
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

// ---------------------------------------------------------------------------
// 登录二次验证开关
// ---------------------------------------------------------------------------

/** 查询当前账号登录时是否要求二次验证。 */
export function getTwoFactorSetting(): Promise<TwoFactorSettingResponse> {
  return request<TwoFactorSettingResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/2fa",
  });
}

/** 修改登录二次验证开关；关闭后登录只需密码，敏感操作仍要求二次验证。 */
export async function updateTwoFactorSetting(enabled: boolean): Promise<void> {
  const body: UpdateTwoFactorRequest = { enabled };
  await request({
    method: "PUT",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/security/2fa",
    data: body,
  });
}
