import type { AuthorizationPreview } from "@repo/shared/api/oauth/types.ts";

import { Alert, Button, Card, Separator, Spinner, toast, Typography } from "@heroui/react";
import { decideAuthorization, getAuthorizePreview } from "@repo/shared/api/oauth/api.ts";
import { useCallback, useEffect, useState } from "react";

import { formatExpiresIn, type OAuthRequestParams } from "../../utils/oauth.ts";
import AppSummary from "./AppSummary.tsx";
import PermissionChecklist from "./PermissionChecklist.tsx";

type PendingAction = "approve" | "deny" | null;

interface AuthorizationConsentProps {
  request: OAuthRequestParams;
}

export default function AuthorizationConsent({ request }: AuthorizationConsentProps) {
  const [preview, setPreview] = useState<AuthorizationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<PendingAction>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(null);
    setPreview(null);
    setSelected(new Set());

    getAuthorizePreview({
      client_id: request.clientID,
      redirect_uri: request.redirectURI || undefined,
      permissions: request.permissions,
      state: request.state || undefined,
      code_challenge: request.codeChallenge || undefined,
    })
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
        setSelected(
          new Set(
            data.permissions
              .filter((permission) => permission.granted)
              .map((permission) => permission.permission),
          ),
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("[FFHub Auth] 读取授权请求失败", error);
        const message = error instanceof Error ? error.message : "无法读取授权请求信息";
        setLoadError(message);
        toast.danger("无法读取授权请求", { description: message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [request]);

  const togglePermission = useCallback((permission: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(permission);
      } else {
        next.delete(permission);
      }
      return next;
    });
  }, []);

  const decide = useCallback(
    async (approve: boolean) => {
      if (!preview || action !== null) return;

      setAction(approve ? "approve" : "deny");

      try {
        const permissions = approve
          ? preview.permissions
              .filter((permission) => permission.granted && selected.has(permission.permission))
              .map((permission) => permission.permission)
          : [];

        const result = await decideAuthorization({
          request_id: preview.request_id,
          approve,
          permissions,
        });

        if (!result.redirect_to) {
          throw new Error("授权结果缺少跳转地址，请返回应用重试");
        }

        window.location.replace(result.redirect_to);
      } catch (error: unknown) {
        console.error("[FFHub Auth] 授权操作失败", error);
        toast.danger("授权失败", {
          description: error instanceof Error ? error.message : "授权操作失败，请稍后重试",
        });
        setAction(null);
      }
    },
    [action, preview, selected],
  );

  if (loading) {
    return (
      <>
        <Card.Header className="mb-2">
          <Card.Title>应用授权</Card.Title>
          <Card.Description>正在加载授权请求…</Card.Description>
        </Card.Header>
        <Card.Content className="flex w-lg max-w-full items-center justify-center py-12">
          <Spinner size="lg" />
        </Card.Content>
      </>
    );
  }

  if (loadError || !preview) {
    return (
      <>
        <Card.Header className="mb-2">
          <Card.Title>应用授权</Card.Title>
          <Card.Description>无法加载授权请求</Card.Description>
        </Card.Header>
        <Card.Content className="flex w-lg max-w-full flex-col gap-3">
          <Typography type="body-sm" color="muted">
            {loadError ?? "授权请求不存在或已过期，请返回应用重新发起授权。"}
          </Typography>
          <Typography type="body-xs" color="muted">
            如果你是从应用跳转而来，请关闭本页并返回应用重试。
          </Typography>
        </Card.Content>
      </>
    );
  }

  const expiry = formatExpiresIn(preview.expires_in);
  const expiryNote = expiry === "已过期" ? "此授权请求已过期。" : `此授权请求将在 ${expiry}过期。`;

  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>应用授权</Card.Title>
        <Card.Description>“{preview.app.name}”请求访问你的账户</Card.Description>
      </Card.Header>

      <Card.Content className="flex w-lg max-w-full flex-col gap-4">
        <AppSummary app={preview.app} />

        <div className="bg-surface-secondary flex flex-col gap-1 rounded-2xl p-3">
          <Typography type="body-xs" color="muted">
            授权后跳转至
          </Typography>
          <Typography type="body-xs" className="break-all">
            {preview.redirect_uri || "—"}
          </Typography>
        </div>

        {preview.already_authorized && (
          <Alert status="accent">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>你之前已授权该应用</Alert.Title>
              <Alert.Description>本次操作会更新该应用可访问的权限范围。</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        <Separator />

        <div className="flex flex-col gap-1">
          <Typography type="h4" className="m-0 text-sm font-medium">
            请求的权限
          </Typography>
          <Typography type="body-xs" color="muted">
            取消勾选可以拒绝授予对应权限。
          </Typography>
        </div>

        <PermissionChecklist
          disabled={action !== null}
          permissions={preview.permissions}
          selected={selected}
          onToggle={togglePermission}
        />

        <div className="flex flex-col gap-1">
          <Typography type="body-xs" color="muted">
            {expiryNote}
          </Typography>
          <Typography type="body-xs" color="muted">
            授权后，该应用将能够以你的身份访问上述数据。请仅在信任该应用时继续。
          </Typography>
        </div>
      </Card.Content>

      <Card.Footer className="mt-4 flex gap-2">
        <Button
          className="w-full"
          isDisabled={action !== null}
          isPending={action === "deny"}
          variant="tertiary"
          onPress={() => void decide(false)}
        >
          拒绝
        </Button>
        <Button
          className="w-full"
          isDisabled={action !== null}
          isPending={action === "approve"}
          onPress={() => void decide(true)}
        >
          授权
        </Button>
      </Card.Footer>
    </>
  );
}
