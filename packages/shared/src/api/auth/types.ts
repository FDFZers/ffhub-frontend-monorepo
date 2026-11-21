import type { JWTPayload } from "jose";

export type TwoFactorMethod = "totp" | "email" | "qq";
export type PasswordResetMethod = "email" | "qq";
export type TokenType = "user" | "stepup" | "oauth";

export interface TokenClaims {
  user_id: number;
  token_type: TokenType;
  /** 仅 OAuth 令牌携带 */
  app_id?: string;
  /** 仅 OAuth 令牌携带：对应授权记录 ID。 */
  auth_id?: number;
  /** 仅提权令牌携带：绑定的登录会话 UUID。 */
  session_id?: string;
  permissions: string[];
  /** 仅用户令牌携带：名下应用 ID。 */
  owned_apps?: number[];
  is_temporary: boolean;
  /** 管理员重置过密码，前端应提示用户尽快重设。 */
  password_reset_required?: boolean;
}

export interface RegisteredTokenClaims extends TokenClaims, JWTPayload {}
