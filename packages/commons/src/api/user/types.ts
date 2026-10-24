import type { DateString } from "../../utils/types.ts";

export type UserType = "student" | "teacher";
export type School = "fdfz" | "ffxh" | "ffqp" | "ffpd" | "ffja";
export type Visibility = "public" | "friends" | "private";

export type OAuthClientType = "confidential" | "public";

export interface PermissionInfo {
  id: number;
  app_id: number;
  value: string;
  description: string;
  parents: number[];
  created_at: DateString;
  updated_at: DateString;
}

export interface UserPermission {
  id: number;
  user_id: number;
  permission: string;
  enabled: boolean;
  valid_from?: DateString;
  valid_until?: DateString;
  created_at: DateString;
  updated_at: DateString;
  note: string;
}

export interface UserPassword {
  user_id: number;
  password: string;
  updated_at: DateString;
}

export interface UserTOTP {
  user_id: number;
  secret: string;
  updated_at: DateString;
}

export interface UserSession {
  uuid: string;
  user_id: number;

  session_token_hash: string;
  is_temporary: boolean;

  created_at: DateString;
  updated_at: DateString;
  expires_at: DateString;
  last_used_at?: DateString;
  revoked_at?: DateString;

  last_ip?: string;
  last_user_agent: string;
}

export interface Visibilities {
  real_name: Visibility;
}

export interface User {
  id: number;
  username: string;

  type: UserType;
  student_num?: string;
  real_name: string;
  school: School;

  nickname?: string;
  signature: string;
  bio: string;

  visibilities: Visibilities;

  created_at: DateString;
  updated_at: DateString;
  deleted_at: DateString | null;
}

export interface UserBan {
  id: number;
  user_id: number;
  reason: string;
  end_time?: DateString;
  created_at: DateString;
  enabled: boolean;
}

export interface UserEmail {
  id: number;
  user_id: number;
  email: string;
  created_at: DateString;
  deleted_at: DateString | null;
}

export interface UserQQ {
  id: number;
  user_id: number;
  qq: string;
  created_at: DateString;
  deleted_at: DateString | null;
}

export interface OAuthApp {
  id: number;
  namespace: string;
  owner_user_id: number;
  secret_hash: string;

  name: string;
  description: string;

  client_type: OAuthClientType;
  redirect_uris: string[];
  requested_permissions: string[];

  created_at: DateString;
  updated_at: DateString;
  deleted_at: DateString | null;
}

export interface UserOAuthApp {
  id: number;
  user_id: number;
  app_id: number;
  permissions: string[];
  updated_at: DateString;
  revoked_at: DateString | null;
}
