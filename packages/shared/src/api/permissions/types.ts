import type { DateString } from "../../utils/types.ts";

export interface PermissionDefinition {
  id: number;
  app_id: number;
  namespace: string;
  /** 完整权限串，如 namespace:users.list。 */
  permission: string;
  value: string;
  description: string;
  requestable: boolean;
  created_by: number | null;
  created_at: DateString;
  updated_at: DateString;
}

export interface PermissionImpliesResponse {
  permission: PermissionDefinition;
  direct_implies: PermissionDefinition[];
  transitive_implies: PermissionDefinition[];
  implied_by: PermissionDefinition[];
}

export interface UserGroup {
  id: number;
  app_id: number;
  name: string;
  note: string;
  public: boolean;
  created_at: DateString;
  updated_at: DateString;
}

export interface UserGroupMember {
  user_id: number;
  username: string;
  nickname: string | null;
  deleted: boolean;
  granted_by: number | null;
  valid_from: DateString | null;
  valid_until: DateString | null;
  created_at: DateString;
}

export interface UserGrant {
  id: number;
  user_id: number;
  permission: string;
  granted_by_user_id: number | null;
  granted_by_app_id: number;
  valid_from: DateString | null;
  valid_until: DateString | null;
  note: string;
  created_at: DateString;
  updated_at: DateString;
}

export interface PermissionReloadStatus {
  last_attempt_at: DateString;
  last_success_at: DateString;
  last_error?: string;
  pending: boolean;
  version: number;
}

export interface AppRef {
  id: number;
  namespace: string;
}
