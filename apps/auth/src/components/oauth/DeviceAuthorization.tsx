import type { DeviceAuthorizationPreview } from "@repo/shared/api/oauth/types.ts";

import { toast } from "@heroui/react";
import { decideDevice, getDevicePreview } from "@repo/shared/api/oauth/api.ts";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import OAuthAuthorizationCard from "./OAuthAuthorizationCard.tsx";
import OAuthDecisionButtons, { type OAuthDecisionAction } from "./OAuthDecisionButtons.tsx";
import OAuthResultCard from "./OAuthResultCard.tsx";

type Decision = "approved" | "denied" | null;

interface DeviceAuthorizationProps {
  userCode: string;
}

export default function DeviceAuthorization({ userCode }: DeviceAuthorizationProps) {
  const navigate = useNavigate();

  const [preview, setPreview] = useState<DeviceAuthorizationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision>(null);
  const [action, setAction] = useState<OAuthDecisionAction>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setPreview(null);
    setDecision(null);

    getDevicePreview(userCode)
      .then((data) => {
        if (!cancelled) setPreview(data);
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

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      void navigate("/oauth/device");
    }
  }, [navigate]);

  const decide = useCallback(
    async (approve: boolean) => {
      if (!preview || action !== null) return;

      setAction(approve ? "approve" : "deny");

      try {
        await decideDevice({ user_code: preview.user_code, approve });
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
    [action, preview],
  );

  const status = decision ?? preview?.status ?? null;

  if (status === "approved" || status === "denied") {
    return <OAuthResultCard status={status} />;
  }

  return (
    <OAuthAuthorizationCard
      app={preview?.app}
      error={loadError}
      footer={
        preview ? (
          <OAuthDecisionButtons
            action={action}
            onApprove={() => void decide(true)}
            onDeny={() => void decide(false)}
          />
        ) : null
      }
      loading={loading}
      loadingText="正在加载设备授权信息…"
      onBack={handleBack}
      permissions={preview?.permissions}
    />
  );
}
