import type { AuthorizationPreview } from "@repo/shared/api/oauth/types.ts";

import { toast } from "@heroui/react";
import { decideAuthorization, getAuthorizePreview } from "@repo/shared/api/oauth/api.ts";
import { useCallback, useEffect, useState } from "react";

import type { OAuthRequestParams } from "../../utils/oauth.ts";

import OAuthAuthorizationCard from "./OAuthAuthorizationCard.tsx";
import OAuthDecisionButtons, { type OAuthDecisionAction } from "./OAuthDecisionButtons.tsx";

interface AuthorizationConsentProps {
  request: OAuthRequestParams;
}

export default function AuthorizationConsent({ request }: AuthorizationConsentProps) {
  const [preview, setPreview] = useState<AuthorizationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [action, setAction] = useState<OAuthDecisionAction>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setPreview(null);

    getAuthorizePreview({
      client_id: request.clientID,
      redirect_uri: request.redirectURI || undefined,
      state: request.state || undefined,
      code_challenge: request.codeChallenge || undefined,
    })
      .then((data) => {
        if (!cancelled) setPreview(data);
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

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign("/");
    }
  }, []);

  const decide = useCallback(
    async (approve: boolean) => {
      if (!preview || action !== null) return;

      setAction(approve ? "approve" : "deny");

      try {
        const result = await decideAuthorization({
          request_id: preview.request_id,
          approve,
        });

        if (!result.redirect_to) {
          throw new Error("授权结果缺少回调地址，请返回应用重试");
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
    [action, preview],
  );

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
      onBack={handleBack}
      permissions={preview?.permissions}
    />
  );
}
