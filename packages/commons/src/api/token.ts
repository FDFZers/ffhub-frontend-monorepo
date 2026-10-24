import { createRemoteJWKSet, jwtVerify } from "jose";
import cookies from "js-cookie";

import type { RegisteredTokenClaims } from "./auth/types.ts";

import { ACCESS_TOKEN_KEY, API_AUTH } from "./types.ts";

const JWKS = createRemoteJWKSet(new URL("auth/jwks", API_AUTH));

export function readAccessToken(): string | undefined {
  return cookies.get(ACCESS_TOKEN_KEY);
}

export async function verifyAccessToken(): Promise<RegisteredTokenClaims | undefined> {
  const token = readAccessToken();
  if (!token) return undefined;

  const { payload } = await jwtVerify(token, JWKS, {
    requiredClaims: ["exp"],
    issuer: "fdfz-student-id",
    algorithms: ["RS512"],
  });

  return payload as RegisteredTokenClaims;
}
