import { selectIsLoggedIn, useUserStore } from "@repo/commons/stores/user.ts";
import { Navigate, Outlet, useLocation } from "react-router";

import ExternalRedirect from "./ExternalRedirect";

const SPACE_URL = "https://space.fdfz.top/";

export function RequireAuth() {
  const location = useLocation();
  const loggedIn = useUserStore(selectIsLoggedIn);
  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
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

export function Entry() {
  const loggedIn = useUserStore(selectIsLoggedIn);
  return loggedIn ? <ExternalRedirect to={SPACE_URL} /> : <Navigate to="/login" replace />;
}
