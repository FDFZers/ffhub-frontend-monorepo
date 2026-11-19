import LoadingOverlay from "@repo/shared/components/LoadingOverlay.tsx";
import { useSessionBootstrap } from "@repo/shared/hooks/useSessionBootstrap.ts";
import ExternalRedirect from "@repo/shared/router/ExternalRedirect.tsx";
import { RequireAuth, RequireGuest } from "@repo/shared/router/Guards.tsx";
import { SPACE_URL } from "@repo/shared/router/urls.ts";
import { selectIsLoggedIn, useUserStore } from "@repo/shared/stores/user.ts";
import { Navigate, Route, Routes, useLocation } from "react-router";

import AuthLayout from "./layouts/AuthLayout.tsx";
import Login from "./views/Login.tsx";
import OAuthAuthorize from "./views/OAuthAuthorize.tsx";
import OAuthDevice from "./views/OAuthDevice.tsx";
import Register from "./views/Register.tsx";
import RegStatus from "./views/RegStatus.tsx";
import ResetPassword from "./views/ResetPassword.tsx";

export default function App() {
  const initialized = useSessionBootstrap();
  const loggedIn = useUserStore(selectIsLoggedIn);
  const location = useLocation();

  return (
    <>
      <LoadingOverlay ready={initialized}>
        {initialized && (
          <Routes>
            <Route
              path="/"
              element={
                loggedIn ? (
                  <ExternalRedirect to={SPACE_URL} />
                ) : (
                  <Navigate replace to={{ pathname: "/login", search: location.search }} />
                )
              }
            />

            <Route element={<RequireGuest />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset_password" element={<ResetPassword />} />
                <Route path="/reg_status" element={<RegStatus />} />
              </Route>
            </Route>

            <Route element={<RequireAuth loginURL="/login" />}>
              <Route element={<AuthLayout />}>
                <Route path="/oauth/authorize" element={<OAuthAuthorize />} />
                <Route path="/oauth/device" element={<OAuthDevice />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </LoadingOverlay>
    </>
  );
}
