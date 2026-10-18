import { selectPermissions, useUserStore } from "../stores/user.ts";

export function useHasPermission(perm: string): boolean {
  return useUserStore((s) => selectPermissions(s).includes(perm));
}

export function useHasAnyPermission(...perms: string[]): boolean {
  return useUserStore((s) => {
    if (perms.length === 0) return true;
    const own = selectPermissions(s);
    return perms.some((p) => own.includes(p));
  });
}

export function useHasAllPermissions(...perms: string[]): boolean {
  return useUserStore((s) => {
    if (perms.length === 0) return true;
    const own = selectPermissions(s);
    return perms.every((p) => own.includes(p));
  });
}
