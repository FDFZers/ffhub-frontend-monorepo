import type { School, UserType } from "../user/types.ts";
import type { TwoFactorMethod } from "./types.ts";

import { request } from "../api.ts";
import { clearSessionHint, markSessionHint } from "../token.ts";
import { API_STUDENT_ID_INTERNAL } from "../types.ts";

export interface LoginInitRequest {
  username: string;
  password: string;
  is_temporary?: boolean;
  altcha_payload: string;
}

export interface LoginInitResponse {
  session_id: string;
  "2fa": TwoFactorMethod[];
  passed: boolean;
}

export function loginInit(req: LoginInitRequest): Promise<LoginInitResponse> {
  return request<LoginInitResponse>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/login/init",
    withToken: false,
    data: req,
  });
}

export async function loginFinalize(sessionID: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/login/finalize",
    withToken: false,
    data: { session_id: sessionID },
  });
  markSessionHint();
}

export async function verifyEmailInit(sessionID: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/verify/email/init",
    withToken: false,
    data: { session_id: sessionID },
  });
}

export async function verifyEmail(sessionID: string, code: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/verify/email/verify",
    withToken: false,
    data: { session_id: sessionID, code },
  });
}

export async function verifyTOTP(sessionID: string, code: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/verify/totp",
    withToken: false,
    data: { session_id: sessionID, code },
  });
}

export interface VerifyQQInitResponse {
  /**
   * 验证码由服务端生成，用户需使用绑定的 QQ 私信发送给机器人。
   * 该接口是幂等的：重复调用会返回同一验证码。
   */
  code?: string;
}

export function verifyQQInit(sessionID: string): Promise<VerifyQQInitResponse> {
  return request<VerifyQQInitResponse>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/verify/qq/init",
    withToken: false,
    data: { session_id: sessionID },
  });
}

export async function verifyQQ(sessionID: string, code: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/verify/qq/verify",
    withToken: false,
    data: { session_id: sessionID, code },
  });
}

export interface PasswordResetInitResponse {
  session_id: string;
  "2fa": TwoFactorMethod[];
}

export function passwordResetInitEmail(
  email: string,
  altchaPayload: string,
): Promise<PasswordResetInitResponse> {
  return request<PasswordResetInitResponse>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/password_reset/init/email",
    withToken: false,
    data: { email, altcha_payload: altchaPayload },
  });
}

export function passwordResetInitQQ(
  qq: string,
  altchaPayload: string,
): Promise<PasswordResetInitResponse> {
  return request<PasswordResetInitResponse>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/password_reset/init/qq",
    withToken: false,
    data: { qq, altcha_payload: altchaPayload },
  });
}

export async function passwordResetFinalize(sessionID: string, password: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/password_reset/finalize",
    withToken: false,
    data: { session_id: sessionID, password },
  });
}

export async function refreshSession(): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/refresh",
    withToken: false,
    // 启动时用它恢复会话，超时时间短一些，避免加载遮罩等待过久。
    timeout: 10_000,
  });
  markSessionHint();
}

export async function logout(): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/auth/logout",
    withToken: false,
    // 访问令牌过期时先走一次 refresh 再重试登出，避免服务端会话仍然有效。
  });
  clearSessionHint();
}

export interface RegisterRequest {
  username: string;
  nickname?: string;
  type: UserType;
  student_num?: string;
  real_name: string;
  school: School;
  password: string;
  proof_image: File;
  altcha_payload: string;
}

export interface RegisterResponse {
  id: string;
}

export async function register(req: RegisterRequest): Promise<string> {
  const form = new FormData();
  form.append("username", req.username);
  if (req.nickname !== undefined) form.append("nickname", req.nickname);
  form.append("type", req.type);
  if (req.student_num !== undefined) {
    form.append("student_num", req.student_num);
  }
  form.append("real_name", req.real_name);
  form.append("school", req.school);
  form.append("password", req.password);
  form.append("altcha_payload", req.altcha_payload);
  form.append("proof_image", req.proof_image);

  return (
    await request<RegisterResponse>({
      method: "POST",
      baseURL: API_STUDENT_ID_INTERNAL,
      url: "/auth/register",
      withToken: false,
      data: form,
    })
  ).id;
}
