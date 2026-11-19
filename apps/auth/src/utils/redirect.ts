import { SPACE_URL } from "@repo/shared/router/urls.ts";

/** 登录页只允许跳回 FFHub 的站点，避免 redirect 参数造成开放重定向。 */
function isAllowedRedirect(url: URL): boolean {
  const host = url.hostname;

  if (import.meta.env.DEV) {
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      (host === "ffhub.localhost" || host.endsWith(".ffhub.localhost"))
    );
  }

  return url.protocol === "https:" && (host === "fdfz.top" || host.endsWith(".fdfz.top"));
}

/** 读取登录页的 redirect 参数；缺失或不在白名单时回到用户空间。 */
export function resolvePostLoginURL(search: string): string {
  const redirect = new URLSearchParams(search).get("redirect");
  if (!redirect) return SPACE_URL;

  try {
    const url = new URL(redirect);
    return isAllowedRedirect(url) ? url.toString() : SPACE_URL;
  } catch {
    return SPACE_URL;
  }
}
