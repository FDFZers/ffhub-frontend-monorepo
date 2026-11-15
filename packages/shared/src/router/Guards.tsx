import { Navigate, Outlet, useLocation } from "react-router";

import { selectIsLoggedIn, useUserStore } from "../stores/user.ts";
import ExternalRedirect from "./ExternalRedirect.tsx";
import { SPACE_URL } from "./urls.ts";

interface RequireAuthProps {
  /** 未登录时跳转的登录页地址；跨应用时传入 AUTH_URL。 */
  loginURL?: string;
}

export function RequireAuth({ loginURL }: RequireAuthProps = {}) {
  const location = useLocation();
  const loggedIn = useUserStore(selectIsLoggedIn);
  if (!loggedIn) {
    if (!loginURL) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    const url = new URL(loginURL, window.location.origin);
    url.searchParams.set("redirect", window.location.href);
    return <ExternalRedirect to={url.toString()} />;
  }
  return <Outlet />;
}

export function RequireGuest() {
  const loggedIn = useUserStore(selectIsLoggedIn);
  if (loggedIn) {
    return <ExternalRedirect to={SPACE_URL} />;
  }
  return <Outlet />;
}
