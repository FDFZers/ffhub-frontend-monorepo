import dayjs from "dayjs";

export interface OAuthRequestParams {
  userCode: string;
  clientID: string;
  redirectURI: string;
  state: string;
  codeChallenge: string;
  permissions: string[];
}

/** 保留重复的 permission 参数，并按后端要求原样传回。 */
export function parseOAuthRequest(search: string): OAuthRequestParams {
  const params = new URLSearchParams(search);

  return {
    userCode: (params.get("user_code") ?? "").trim(),
    clientID: (params.get("client_id") ?? "").trim(),
    redirectURI: params.get("redirect_uri") ?? "",
    state: params.get("state") ?? "",
    codeChallenge: params.get("code_challenge") ?? "",
    permissions: params.getAll("permission").filter((permission) => permission.length > 0),
  };
}

/** 把用户输入整理成后端约定的 ABCD-EFGH 格式。 */
export function formatUserCodeInput(value: string): string {
  const characters = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  return characters.length > 4 ? `${characters.slice(0, 4)}-${characters.slice(4)}` : characters;
}

export function isCompleteUserCode(value: string): boolean {
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(value);
}

/** 设备返回的授权码可能没有连字符，展示时统一补上。 */
export function displayUserCode(value: string): string {
  const normalized = value.trim().toUpperCase();
  return /^[A-Z0-9]{8}$/.test(normalized)
    ? `${normalized.slice(0, 4)}-${normalized.slice(4)}`
    : normalized;
}

export function formatDateTime(value: string): string {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : value;
}

/** 把授权确认页的 expires_in 转成易读时长。 */
export function formatExpiresIn(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "已过期";

  if (seconds < 60) {
    return `${Math.ceil(seconds)} 秒内`;
  }
  if (seconds < 3600) {
    return `${Math.ceil(seconds / 60)} 分钟内`;
  }
  return `${Math.ceil(seconds / 3600)} 小时内`;
}

export function isSafeHTTPURL(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
