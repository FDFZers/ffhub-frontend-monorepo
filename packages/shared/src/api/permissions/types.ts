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

/** 权限继承边的授权记录，对应后端 handling.ImplicationJSON 的 grant 字段。 */
export interface PermissionGrantInfo {
  granted_by_user_id: number | null;
  valid_from: DateString | null;
  valid_until: DateString | null;
  note: string;
  created_at: DateString;
  updated_at: DateString;
}

/** 一条权限继承边：被继承的权限定义及其授权记录。 */
export interface PermissionImplication {
  permission: PermissionDefinition;
  grant: PermissionGrantInfo;
}

export interface PermissionImpliesResponse {
  permission: PermissionDefinition;
  /** 直接继承的权限及其授权记录。 */
  direct_implies: PermissionImplication[];
  /** 传递继承的权限定义（不携带授权记录）。 */
  transitive_implies: PermissionDefinition[];
  /** 反向继承本权限的边。 */
  implied_by: PermissionImplication[];
}

/** 用户组权限项，对应后端 handling.RolePermissionJSON。 */
export interface RolePermission {
  permission: string;
  granted_by_user_id: number | null;
  valid_from: DateString | null;
  valid_until: DateString | null;
  note: string;
  created_at: DateString;
  updated_at: DateString;
}

export interface UserGroup {
  id: number;
  app_id: number;
  name: string;
  note: string;
  public: boolean;
  /** 内置系统用户组，不允许删除。 */
  system: boolean;
  created_at: DateString;
  updated_at: DateString;
}

/** 用户组搜索结果：附带该用户组所属应用的命名空间。 */
export interface UserGroupSearchResult extends UserGroup {
  app_namespace: string;
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
