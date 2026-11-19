export interface OAuthRequestParams {
  userCode: string;
  clientID: string;
  redirectURI: string;
  state: string;
  codeChallenge: string;
}

/** 只解析协议参数；权限固定取自应用登记值，忽略 URL 中的 permission。 */
export function parseOAuthRequest(search: string): OAuthRequestParams {
  const params = new URLSearchParams(search);

  return {
    userCode: (params.get("user_code") ?? "").trim(),
    clientID: (params.get("client_id") ?? "").trim(),
    redirectURI: params.get("redirect_uri") ?? "",
    state: params.get("state") ?? "",
    codeChallenge: params.get("code_challenge") ?? "",
  };
}

export function isCompleteUserCode(value: string): boolean {
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(value);
}
