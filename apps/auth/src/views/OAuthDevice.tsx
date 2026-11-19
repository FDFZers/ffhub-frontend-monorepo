import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router";

import DeviceAuthorization from "../components/oauth/DeviceAuthorization.tsx";
import DeviceCodeForm from "../components/oauth/DeviceCodeForm.tsx";
import { parseOAuthRequest } from "../utils/oauth.ts";

export default function OAuthDevice() {
  const { search } = useLocation();
  const request = useMemo(() => parseOAuthRequest(search), [search]);

  return (
    <>
      <Helmet>
        <title>设备授权 - 复旦附中学生 ID</title>
      </Helmet>
      {request.userCode ? <DeviceAuthorization userCode={request.userCode} /> : <DeviceCodeForm />}
    </>
  );
}
