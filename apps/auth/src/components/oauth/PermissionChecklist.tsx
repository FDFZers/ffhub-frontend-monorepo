import type { OAuthPermissionInfo } from "@repo/shared/api/oauth/types.ts";

import { Checkbox, Chip, Label, Typography } from "@heroui/react";

interface PermissionChecklistProps {
  permissions: OAuthPermissionInfo[];
  selected: Set<string>;
  disabled?: boolean;
  onToggle: (permission: string, selected: boolean) => void;
}

export default function PermissionChecklist({
  permissions,
  selected,
  disabled,
  onToggle,
}: PermissionChecklistProps) {
  if (permissions.length === 0) {
    return (
      <Typography type="body-sm" color="muted">
        该应用未请求任何权限。
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {permissions.map((permission) => {
        const title = permission.description.trim() || permission.permission;

        return (
          <div
            className="border-border/60 flex flex-col gap-1 rounded-2xl border p-3"
            key={permission.permission}
          >
            <Checkbox
              className="w-full"
              isDisabled={disabled || !permission.granted}
              isSelected={permission.granted && selected.has(permission.permission)}
              variant="secondary"
              onChange={(checked) => {
                if (permission.granted) onToggle(permission.permission, checked);
              }}
            >
              <Checkbox.Content className="w-full items-start gap-3">
                <Checkbox.Control className="mt-0.5 shrink-0">
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <Label className="text-sm font-medium">{title}</Label>
                    <Chip
                      color={permission.granted ? "success" : "warning"}
                      size="sm"
                      variant="soft"
                    >
                      {permission.granted ? "可授权" : "不可授权"}
                    </Chip>
                  </span>
                  <Typography
                    type="body-xs"
                    color="muted"
                    className="font-mono break-all"
                    slot="description"
                  >
                    {permission.permission}
                  </Typography>
                </span>
              </Checkbox.Content>
            </Checkbox>
            {!permission.granted && (
              <Typography type="body-xs" className="text-warning pl-8">
                无法授予：{permission.reason?.trim() || "该应用当前不具备申请此项权限的资格"}
              </Typography>
            )}
          </div>
        );
      })}
    </div>
  );
}
