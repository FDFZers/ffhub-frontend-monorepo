import type { DateString } from "../../utils/types.ts";

export type AppClientType = "confidential" | "public" | "confidential_device" | "public_device";
export type AppStatus = "active" | "suspended";
export type AppAuthStatus = "active" | "update_suspended";

/** 与 backend handling.AppInfo 对应的 OAuth 应用信息。 */
export interface AppInfo {
  id: number;
  namespace: string;
  owner_user_id: number;
  name: string;
  description: string;
  homepage_url: string;
  client_type: AppClientType;
  redirect_uris: string[];
  requested_perms: string[];
  status: AppStatus;
  has_secret: boolean;
  created_at: DateString;
  updated_at: DateString;
}

/** 用户在账户设置中看到的授权记录。 */
export interface AuthorizationInfo {
  id: number;
  app: AppInfo;
  permissions: string[];
  status: AppAuthStatus;
  created_at: DateString;
  updated_at: DateString;
  last_used_at: DateString | null;
}
