import { useCallback } from "react";

import { logout } from "../api/auth/api.ts";
import { clearSessionHint } from "../api/token.ts";
import { AUTH_URL } from "../router/urls.ts";
import { useUserStore } from "../stores/user.ts";

/** 注销当前会话并回到登录页；即使接口失败也会清空本地状态。 */
export function useLogout(): () => Promise<void> {
  return useCallback(async () => {
    try {
      await logout();
    } catch (e: unknown) {
      console.warn("[FFHub] 注销接口请求失败，仍清理本地状态", e);
    } finally {
      useUserStore.getState().clear();
      clearSessionHint();
      window.location.replace(AUTH_URL);
    }
  }, []);
}
