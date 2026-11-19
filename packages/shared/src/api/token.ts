import cookies from "js-cookie";

import type { RegisteredTokenClaims } from "./auth/types.ts";

import { ACCESS_TOKEN_KEY, API_STUDENT_ID_INTERNAL } from "./types.ts";

/** 访问令牌内只保存权限 ID 与少量元数据，权限串与应用列表由 claims 接口解析。 */
const CLAIMS_URL = new URL("auth/claims", API_STUDENT_ID_INTERNAL).toString();

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

  // 签名与有效期由服务端校验；这里只取回可读声明（权限串、名下应用等）。
  const res = await fetch(CLAIMS_URL, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) return undefined;

  return (await res.json()) as RegisteredTokenClaims;
}
