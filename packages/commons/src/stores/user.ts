import { create } from "zustand";

import type { RegisteredTokenClaims } from "../api/auth/types.ts";
import type { User } from "../api/user/types.ts";

import { verifyAccessToken } from "../api/token.ts";

interface UserState {
  user: User | null;
  claims: RegisteredTokenClaims | null;
  initialized: boolean;

  syncClaims: () => Promise<RegisteredTokenClaims | null>;
  setUser: (user: User | null) => void;
  setInitialized: (v: boolean) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  claims: null,
  initialized: false,

  syncClaims: async () => {
    const claims = (await verifyAccessToken()) ?? null;
    set({ claims });
    return claims;
  },
  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized }),
  clear: () => set({ user: null, claims: null }),
}));

export const selectPermissions = (s: UserState) => s.claims?.permissions ?? [];
export const selectIsLoggedIn = (s: UserState) =>
  !!s.claims?.exp && s.claims.exp * 1000 > Date.now();
export const selectUserId = (s: UserState) => s.claims?.user_id ?? null;
export const selectIsTemporary = (s: UserState) => s.claims?.is_temporary ?? false;
