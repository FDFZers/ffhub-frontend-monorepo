import { useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router";

import AuthorizationConsent from "../components/oauth/AuthorizationConsent.tsx";
import OAuthAuthorizationCard from "../components/oauth/OAuthAuthorizationCard.tsx";
import { parseOAuthRequest } from "../utils/oauth.ts";

export default function OAuthAuthorize() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const request = useMemo(() => parseOAuthRequest(search), [search]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      void navigate("/");
    }
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>应用授权 - 复旦附中学生 ID</title>
      </Helmet>
      {request.clientID ? (
        <AuthorizationConsent request={request} />
      ) : (
        <OAuthAuthorizationCard error="授权请求缺少 client_id 参数。" onBack={handleBack} />
      )}
    </>
  );
}
