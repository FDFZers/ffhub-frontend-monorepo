import { createRemoteJWKSet, jwtVerify } from "jose";
import cookies from "js-cookie";

import type { RegisteredTokenClaims } from "./auth/types.ts";

import { ACCESS_TOKEN_KEY, API_STUDENT_ID } from "./types.ts";

const JWKS = createRemoteJWKSet(new URL("auth/jwks", API_STUDENT_ID));

const SESSION_HINT_KEY = "ffhub.session_hint";

/** localStorage 在隐私模式或被策略禁用时可能抛错，读写失败一律按“没有提示”处理。 */
function hintStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * 是否在本浏览器登录过。
 * `session_token` 是 HttpOnly Cookie，前端无法判断其是否存在；用这个本地标记
 * 避免未登录访客每次打开 auth 页面都发一次必然 401 的刷新请求。
 */
export function hasSessionHint(): boolean {
  try {
    return hintStorage()?.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSessionHint(): void {
  try {
    hintStorage()?.setItem(SESSION_HINT_KEY, "1");
  } catch {
    // 忽略存储不可用；只是自动恢复会话失效，不影响正常登录。
  }
}

export function clearSessionHint(): void {
  try {
    hintStorage()?.removeItem(SESSION_HINT_KEY);
  } catch {
    // 同上。
  }
}

export function readAccessToken(): string | undefined {
  return cookies.get(ACCESS_TOKEN_KEY);
}

export async function verifyAccessToken(): Promise<RegisteredTokenClaims | undefined> {
  const token = readAccessToken();
  if (!token) return undefined;

  const { payload } = await jwtVerify(token, JWKS, {
    requiredClaims: ["exp"],
    issuer: "fdfz-student-id",
    algorithms: ["RS512"],
    clockTolerance: 5,
  });

  return payload as RegisteredTokenClaims;
}
