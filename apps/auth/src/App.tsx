import type { RegisteredTokenClaims } from "@repo/commons/api/auth/types.ts";

import { toast } from "@heroui/react";
import LoadingOverlay from "@repo/commons/components/LoadingOverlay.tsx";
import { useUserStore } from "@repo/commons/stores/user.ts";
import { useEffect, useRef } from "react";
import { Navigate, Route, Routes } from "react-router";

import AuthLayout from "./layouts/AuthLayout.tsx";
import { Entry, RequireAuth, RequireGuest } from "./router/Guards.tsx";
import Login from "./views/Login.tsx";
import OAuthRequest from "./views/OAuthRequest.tsx";
import Register from "./views/Register.tsx";
import RegStatus from "./views/RegStatus.tsx";

export default function App() {
  const initialized = useUserStore((s: any) => s.initialized);
  const bootStartedRef = useRef(false);

  useEffect(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;

    const { syncClaims, setInitialized } = useUserStore.getState();

    syncClaims()
      .then((c: RegisteredTokenClaims | null) => {
        if (!c) {
          setInitialized(true);
          return;
        }
      })
      .catch((e: any) => {
        console.error("[FFHub Auth] 令牌信息解析失败", e);
        toast.danger("令牌信息解析失败");
      });
  });

  return (
    <>
      <LoadingOverlay ready={initialized}>
        <Routes>
          <Route path="/" element={<Entry />} />

          <Route element={<RequireGuest />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/reg_status" element={<RegStatus />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/oauth" element={<OAuthRequest />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LoadingOverlay>
    </>
  );
}
