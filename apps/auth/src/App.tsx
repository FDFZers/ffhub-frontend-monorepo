import type { RegisteredTokenClaims } from "@repo/commons/api/auth/types.ts";
import type { User } from "@repo/commons/api/user/types.ts";

import { toast } from "@heroui/react";
import { request } from "@repo/commons/api/api.ts";
import { API_AUTH, type ApiError } from "@repo/commons/api/types.ts";
import LoadingOverlay from "@repo/commons/components/LoadingOverlay.tsx";
import { useUserStore } from "@repo/commons/stores/user";
import { useEffect, useRef } from "react";
import { Navigate, Route, Routes } from "react-router";

import AuthLayout from "./layouts/AuthLayout.tsx";
import { Entry, RequireAuth, RequireGuest } from "./router/Guards.tsx";
import Login from "./views/Login.tsx";
import OAuthRequest from "./views/OAuthRequest.tsx";
import Register from "./views/Register.tsx";

export default function App() {
  const initialized = useUserStore((s: any) => s.initialized);
  const bootStartedRef = useRef(false);

  useEffect(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;

    const { syncClaims, setUser, setInitialized } = useUserStore.getState();

    syncClaims()
      .then((c: RegisteredTokenClaims | null) => {
        if (!c) {
          setInitialized(true);
          return;
        }
        request<User>({
          baseURL: API_AUTH,
          url: "/users/me",
          method: "GET",
          withToken: true,
          logoutIfTokenExpired: true,
        })
          .then((u) => {
            setUser(u);
            setInitialized(true);
          })
          .catch((e: ApiError) => {
            console.error("[FFHub Auth] 用户信息获取失败", e);
            toast.danger("用户信息获取失败", {
              description: e.message,
            });
          });
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

          <Route element={<RequireAuth />}>
            <Route path="/oauth" element={<OAuthRequest />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LoadingOverlay>
    </>
  );
}
