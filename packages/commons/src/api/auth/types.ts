import type { JWTPayload } from "jose";

export type TwoFactorMethod = "totp" | "email" | "qq";
export type TokenType = "user" | "stepup" | "oauth";

export interface TokenClaims {
  user_id: number;
  token_type: TokenType;
  app_id?: string;
  nonce?: string;
  permissions: string[];
  is_temporary: boolean;
}

export interface RegisteredTokenClaims extends TokenClaims, JWTPayload {}
