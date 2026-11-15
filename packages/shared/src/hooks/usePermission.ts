import { selectPermissions, useUserStore } from "../stores/user.ts";

interface ParsedPermission {
  namespace: string | null;
  nodes: string[];
}

function parsePermission(value: string): ParsedPermission {
  const separator = value.indexOf(":");
  if (separator === -1) {
    return { namespace: null, nodes: value.split(".") };
  }
  return {
    namespace: value.slice(0, separator),
    nodes: value.slice(separator + 1).split("."),
  };
}

/**
 * 权限值由后端签发到访问令牌 claims 中，前端不再维护完整权限串常量。
 * 调用方传入权限的 value 部分（例如 apps.list），也兼容完整权限串。
 *
 * 匹配规则：
 * - 传入完整权限串（含命名空间）时优先校验命名空间；
 * - 传入 value 时比较 claims 中权限串的 ":" 后半段；
 * - 支持后端尚未展开的 * / ** 模式（claims 中出现时）。
 */
export function permissionMatches(granted: string, required: string): boolean {
  const grantedPermission = parsePermission(granted.trim());
  const requiredPermission = parsePermission(required.trim());
  if (requiredPermission.nodes.length === 0) return false;
  if (requiredPermission.nodes.every((node) => node.length === 0)) return false;

  if (
    grantedPermission.namespace !== null &&
    requiredPermission.namespace !== null &&
    grantedPermission.namespace !== requiredPermission.namespace
  ) {
    return false;
  }

  return matchNodes(grantedPermission.nodes, requiredPermission.nodes);
}

function matchNodes(patternNodes: string[], valueNodes: string[]): boolean {
  function visit(patternIndex: number, valueIndex: number): boolean {
    if (patternIndex >= patternNodes.length) return valueIndex >= valueNodes.length;
    if (valueIndex >= valueNodes.length) return false;

    const node = patternNodes[patternIndex];
    if (node === "**") {
      for (let next = valueIndex + 1; next <= valueNodes.length; next += 1) {
        if (visit(patternIndex + 1, next)) return true;
      }
      return false;
    }
    if (node === "*" || node === valueNodes[valueIndex]) {
      return visit(patternIndex + 1, valueIndex + 1);
    }
    return false;
  }

  return visit(0, 0);
}

export function hasPermission(permissions: string[], required: string): boolean {
  return permissions.some((permission) => permissionMatches(permission, required));
}

export function hasAnyPermission(permissions: string[], required: string[]): boolean {
  if (required.length === 0) return true;
  return required.some((permission) => hasPermission(permissions, permission));
}

export function hasAllPermissions(permissions: string[], required: string[]): boolean {
  if (required.length === 0) return true;
  return required.every((permission) => hasPermission(permissions, permission));
}

export function useHasPermission(required: string): boolean {
  return useUserStore((s) => hasPermission(selectPermissions(s), required));
}

export function useHasAnyPermission(...required: string[]): boolean {
  return useUserStore((s) => hasAnyPermission(selectPermissions(s), required));
}

export function useHasAllPermissions(...required: string[]): boolean {
  return useUserStore((s) => hasAllPermissions(selectPermissions(s), required));
}
