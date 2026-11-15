import { useEffect, useRef } from "react";

import { refreshSession } from "../api/auth/api.ts";
import { clearSessionHint, hasSessionHint, markSessionHint } from "../api/token.ts";
import { useUserStore } from "../stores/user.ts";

/**
 * 启动时恢复登录态：先校验 access_token，必要时用 HttpOnly 的 session_token 刷新。
 * 返回 initialized，供 LoadingOverlay 结束启动动画。
 */
export function useSessionBootstrap(): boolean {
  const initialized = useUserStore((state) => state.initialized);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const { syncClaims, setInitialized } = useUserStore.getState();

    void (async () => {
      try {
        try {
          await syncClaims();
        } catch (e: unknown) {
          console.warn("[FFHub] 访问令牌校验失败", e);
          useUserStore.getState().clear();
        }

        if (useUserStore.getState().claims !== null) {
          markSessionHint();
        } else if (hasSessionHint()) {
          try {
            await refreshSession();
          } catch (e: unknown) {
            console.warn("[FFHub] 会话刷新失败，按未登录处理", e);
            clearSessionHint();
            return;
          }

          try {
            await syncClaims();
          } catch (e: unknown) {
            console.warn("[FFHub] 刷新后令牌校验失败", e);
          }
        }
      } finally {
        setInitialized(true);
      }
    })();
  }, []);

  return initialized;
}
