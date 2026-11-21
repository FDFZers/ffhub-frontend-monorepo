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

/** GET /security/binding/status 的响应：三种二次验证方式是否已绑定。 */
export interface BindingsStatusResponse {
  email: boolean;
  qq: boolean;
  totp: boolean;
}

/** GET /security/binding/email 的响应；未绑定时为 null。 */
export interface BindingEmailResponse {
  email: string | null;
}

/** GET /security/binding/qq 的响应；未绑定时为 null。 */
export interface BindingQQResponse {
  qq: string | null;
}

/** 单项绑定信息：bound 来自 status 接口，value 来自各自的读取接口。 */
export interface BindingEntry<T> {
  bound: boolean;
  /** 缺少对应 binding.read.* 权限或未绑定时为 null。 */
  value: T | null;
}

/**
 * 账号安全页的绑定信息聚合视图。
 * 后端把「是否绑定」与「绑定值」拆成三个接口，读取值需要额外的 binding.read.email / binding.read.qq 权限。
 */
export interface BindingsResponse {
  email: BindingEntry<string>;
  qq: BindingEntry<string>;
  totp: boolean;
}

export interface QQBindInitResponse {
  code?: string;
}

export interface TOTPBindInitResponse {
  secret: string;
  url: string;
}

/** GET /security/2fa 的响应：登录时是否要求二次验证。 */
export interface TwoFactorSettingResponse {
  enabled: boolean;
}

/** PUT /security/2fa 的请求体；关闭后仅登录免验证，敏感操作仍需验证。 */
export interface UpdateTwoFactorRequest {
  enabled: boolean;
}
