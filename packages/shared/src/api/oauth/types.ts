import type { DateString } from "../../utils/types.ts";
import type { AppInfo } from "../apps/types.ts";

export interface OAuthPermissionInfo {
  permission: string;
  description: string;
  granted: boolean;
  reason?: string;
}

/** GET /api/v1/oauth/authorize 的确认页数据。 */
export interface AuthorizationPreview {
  request_id: string;
  expires_in: number;
  app: AppInfo;
  redirect_uri: string;
  state: string;
  permissions: OAuthPermissionInfo[];
  already_authorized: boolean;
}

export interface AuthorizationDecisionResponse {
  redirect_to: string;
}

export type DeviceAuthStatus = "pending" | "approved" | "denied";

export interface DeviceAuthorizationPreview {
  app: AppInfo;
  user_code: string;
  permissions: OAuthPermissionInfo[];
  status: DeviceAuthStatus;
  expires_at: DateString;
}
