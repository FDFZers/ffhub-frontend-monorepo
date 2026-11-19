import type { AppInfo } from "@repo/shared/api/apps/types.ts";
import type { OAuthPermissionInfo } from "@repo/shared/api/oauth/types.ts";
import type { ReactNode } from "react";

import { Button, Card, Spinner, Typography } from "@heroui/react";
import { LucideCircleExclamationPoint } from "lucide-react";

import AppSummary from "./AppSummary.tsx";
import PermissionChecklist from "./PermissionChecklist.tsx";

interface OAuthAuthorizationCardProps {
  app?: AppInfo;
  permissions?: OAuthPermissionInfo[];
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
  onBack?: () => void;
  footer?: ReactNode;
}

/** 普通授权与设备授权共用的授权卡片。 */
export default function OAuthAuthorizationCard({
  app,
  permissions = [],
  loading = false,
  loadingText = "正在加载授权请求…",
  error = null,
  onBack,
  footer,
}: OAuthAuthorizationCardProps) {
  if (loading) {
    return (
      <>
        <Card.Header className="mb-2">
          <Card.Title>应用授权</Card.Title>
          <Card.Description>{loadingText}</Card.Description>
        </Card.Header>
        <Card.Content className="flex w-full items-center justify-center py-12">
          <Spinner size="lg" />
        </Card.Content>
      </>
    );
  }

  if (error || !app) {
    return (
      <Card.Content className="flex w-md max-w-full flex-col items-center gap-4">
        <LucideCircleExclamationPoint className="text-danger mt-4 size-24" />
        <div className="flex flex-col items-center justify-center gap-2">
          <Typography type="h3">授权请求获取失败</Typography>
          <Typography type="body-sm" color="muted" className="text-center">
            {error ?? "请返回应用重新发起授权"}
          </Typography>
        </div>
        <Button fullWidth variant="primary" onPress={onBack}>
          返回
        </Button>
      </Card.Content>
    );
  }

  return (
    <>
      <Card.Header className="mb-2">
        <AppSummary app={app} />
        <Card.Title className="mt-4">应用授权</Card.Title>
        <Card.Description>
          “{app.name}”请求访问你的账户。授权后，该应用将能够以你的身份使用下列权限。
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex w-lg max-w-full flex-col gap-4">
        <PermissionChecklist permissions={permissions} />
      </Card.Content>

      {footer ? <Card.Footer className="mt-4 flex gap-2">{footer}</Card.Footer> : null}
    </>
  );
}
