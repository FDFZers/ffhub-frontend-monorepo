import type { DeviceAuthorizationPreview } from "@repo/shared/api/oauth/types.ts";

import { Alert, Button, Card, Chip, Separator, Spinner, toast, Typography } from "@heroui/react";
import { decideDevice, getDevicePreview } from "@repo/shared/api/oauth/api.ts";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { displayUserCode, formatDateTime } from "../../utils/oauth.ts";
import AppSummary from "./AppSummary.tsx";
import PermissionChecklist from "./PermissionChecklist.tsx";

type Decision = "approved" | "denied" | null;
type PendingAction = "approve" | "deny" | null;

const STATUS_META = {
  pending: { label: "待确认", color: "warning" },
  approved: { label: "已授权", color: "success" },
  denied: { label: "已拒绝", color: "danger" },
} as const;

interface DeviceAuthorizationProps {
  userCode: string;
}

export default function DeviceAuthorization({ userCode }: DeviceAuthorizationProps) {
  const navigate = useNavigate();

  const [preview, setPreview] = useState<DeviceAuthorizationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [decision, setDecision] = useState<Decision>(null);
  const [action, setAction] = useState<PendingAction>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(null);
    setPreview(null);
    setSelected(new Set());
    setDecision(null);

    getDevicePreview(userCode)
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
        console.error("[FFHub Auth] 读取设备授权信息失败", error);
        const message = error instanceof Error ? error.message : "无法读取设备授权信息";
        setLoadError(message);
        toast.danger("无法读取设备授权信息", { description: message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userCode]);

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

        await decideDevice(
          approve
            ? { user_code: preview.user_code, approve: true, permissions }
            : { user_code: preview.user_code, approve: false },
        );
        setDecision(approve ? "approved" : "denied");
      } catch (error: unknown) {
        console.error("[FFHub Auth] 设备授权操作失败", error);
        toast.danger("设备授权失败", {
          description: error instanceof Error ? error.message : "设备授权操作失败，请稍后重试",
        });
      } finally {
        setAction(null);
      }
    },
    [action, preview, selected],
  );

  if (loading) {
    return (
      <>
        <Card.Header className="mb-2">
          <Card.Title>设备授权</Card.Title>
          <Card.Description>正在读取设备授权信息…</Card.Description>
        </Card.Header>
        <Card.Content className="flex w-md max-w-full items-center justify-center py-12">
          <Spinner size="lg" />
        </Card.Content>
      </>
    );
  }

  if (loadError || !preview) {
    return (
      <>
        <Card.Header className="mb-2">
          <Card.Title>设备授权</Card.Title>
          <Card.Description>无法读取设备授权信息</Card.Description>
        </Card.Header>
        <Card.Content className="flex w-md max-w-full flex-col gap-3">
          <Typography type="body-sm" color="muted">
            {loadError ?? "授权码不存在或已过期，请在设备上重新获取授权码。"}
          </Typography>
          <Button className="w-full" variant="tertiary" onPress={() => navigate("/oauth")}>
            重新输入授权码
          </Button>
        </Card.Content>
      </>
    );
  }

  const status = decision ?? preview.status;
  const meta = STATUS_META[status];
  const permissionsDisabled = action !== null;
  const expiresAt = formatDateTime(preview.expires_at);

  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>设备授权</Card.Title>
        <Card.Description>
          {status === "pending" ? "请确认设备上的授权请求" : "设备授权处理结果"}
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <AppSummary app={preview.app} />

        <div className="bg-surface-secondary flex flex-col items-center gap-1 rounded-3xl px-4 py-3">
          <Typography type="body-xs" color="muted">
            设备授权码
          </Typography>
          <Typography type="h2" className="font-mono tracking-widest">
            {displayUserCode(preview.user_code)}
          </Typography>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Typography type="body-sm" color="muted">
              状态
            </Typography>
            <Chip color={meta.color} size="sm" variant="soft">
              {meta.label}
            </Chip>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Typography type="body-sm" color="muted">
              有效期至
            </Typography>
            <Typography type="body-sm">{expiresAt}</Typography>
          </div>
        </div>

        {status === "approved" && (
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>授权成功</Alert.Title>
              <Alert.Description>已完成设备授权，可以返回设备继续操作。</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {status === "denied" && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>已拒绝授权</Alert.Title>
              <Alert.Description>设备上的授权请求已取消，应用不会获得任何权限。</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {status === "pending" && (
          <>
            <Separator />
            <div className="flex flex-col gap-1">
              <Typography type="h4" className="m-0 text-sm font-medium">
                请求的权限
              </Typography>
              <Typography type="body-xs" color="muted">
                仅勾选的权限会授予设备上的应用。
              </Typography>
            </div>
            <PermissionChecklist
              disabled={permissionsDisabled}
              permissions={preview.permissions}
              selected={selected}
              onToggle={togglePermission}
            />
          </>
        )}
      </Card.Content>

      {status === "pending" ? (
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
      ) : (
        <Card.Footer className="mt-4">
          <Button className="w-full" variant="tertiary" onPress={() => navigate("/oauth")}>
            授权其他设备
          </Button>
        </Card.Footer>
      )}
    </>
  );
}
