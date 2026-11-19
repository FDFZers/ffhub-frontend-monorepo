import type { DateString } from "../../utils/types.ts";

/** 会话列表项，与后端 handling.SessionInfo 对应。 */
export interface UserSessionInfo {
  uuid: string;
  is_current: boolean;
  is_temporary: boolean;
  created_at: DateString;
  updated_at: DateString;
  expires_at: DateString;
  last_used_at: DateString | null;
  last_ip: string | null;
  last_user_agent: string;
}

export interface SessionListResponse {
  sessions: UserSessionInfo[];
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  /** 是否撤销其他登录会话，缺省时后端按 true 处理。 */
  revoke_other_sessions?: boolean;
}

/** 当前账号已绑定的二次验证方式；未绑定的邮箱或 QQ 为 null。 */
export interface BindingsResponse {
  email: string | null;
  qq: string | null;
  totp: boolean;
}

export interface QQBindInitResponse {
  code?: string;
}

export interface TOTPBindInitResponse {
  secret: string;
  url: string;
}
