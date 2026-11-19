import type { OAuthPermissionInfo } from "@repo/shared/api/oauth/types.ts";

import { Chip, Typography } from "@heroui/react";

interface PermissionChecklistProps {
  permissions: OAuthPermissionInfo[];
}

/** 只读列表：展示实际可授予的权限介绍、来源应用与权限 ID。 */
export default function PermissionChecklist({ permissions }: PermissionChecklistProps) {
  const granted = permissions.filter((permission) => permission.granted);

  return (
    <ul className="marker:text-muted list-disc space-y-3 pl-5">
      <li className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Typography type="body-sm" weight="semibold">
            获取用户 ID
          </Typography>
          <Chip size="sm" variant="soft">
            内置
          </Chip>
        </div>
      </li>
      {granted.map((permission) => {
        const title = permission.description.trim() || permission.permission;

        return (
          <li className="space-y-1" key={permission.permission}>
            <div className="flex flex-wrap items-center gap-2">
              <Typography type="body-sm" weight="semibold">
                {title}
              </Typography>
              {permission.source_app && (
                <Chip size="sm" variant="soft">
                  {permission.source_app}
                </Chip>
              )}
            </div>
            <Typography type="body-xs" color="muted" className="font-mono break-all">
              {permission.permission}
            </Typography>
          </li>
        );
      })}
    </ul>
  );
}
