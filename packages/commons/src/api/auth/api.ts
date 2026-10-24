import type { School, UserType } from "../user/types.ts";
import type { TwoFactorMethod } from "./types.ts";

import { request } from "../api.ts";
import { API_AUTH_INTERNAL } from "../types.ts";

export interface LoginInitRequest {
  username: string;
  password: string;
  is_temporary?: boolean;
  altcha_payload: string;
}

export interface LoginInitResponse {
  session_id: string;
  "2fa": TwoFactorMethod[];
}

export function loginInit(req: LoginInitRequest): Promise<LoginInitResponse> {
  return request<LoginInitResponse>({
    method: "POST",
    baseURL: API_AUTH_INTERNAL,
    url: "/auth/login/init",
    withToken: false,
    data: req,
  });
}

export async function loginFinalize(sessionID: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_AUTH_INTERNAL,
    url: "/auth/login/finalize",
    withToken: false,
    data: { session_id: sessionID },
  });
}

export async function verifyEmailInit(sessionID: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_AUTH_INTERNAL,
    url: "/auth/verify/email/init",
    withToken: false,
    data: { session_id: sessionID },
  });
}

export async function verifyEmail(sessionID: string, code: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_AUTH_INTERNAL,
    url: "/auth/verify/email/verify",
    withToken: false,
    data: { session_id: sessionID, code },
  });
}

export async function verifyTOTP(sessionID: string, code: string): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_AUTH_INTERNAL,
    url: "/auth/verify/totp",
    withToken: false,
    data: { session_id: sessionID, code },
  });
}

export async function refreshSession(): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_AUTH_INTERNAL,
    url: "/auth/refresh",
    withToken: false,
  });
}

export async function logout(): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_AUTH_INTERNAL,
    url: "/auth/logout",
    withToken: false,
    skipRefresh: true,
  });
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
      baseURL: API_AUTH_INTERNAL,
      url: "/auth/register",
      withToken: false,
      data: form,
    })
  ).id;
}
