import { Button, Card, InputGroup, Label, Separator, TextField, Typography } from "@heroui/react";
import { LucideKeyRound, LucideMonitorSmartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router";

import AuthorizationConsent from "../components/oauth/AuthorizationConsent.tsx";
import DeviceAuthorization from "../components/oauth/DeviceAuthorization.tsx";
import { formatUserCodeInput, isCompleteUserCode, parseOAuthRequest } from "../utils/oauth.ts";

function DeviceCodeLanding() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const isValid = isCompleteUserCode(code);

  const submit = () => {
    if (!isValid) return;
    void navigate(`/oauth?user_code=${encodeURIComponent(code)}`);
  };

  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>应用授权</Card.Title>
        <Card.Description>使用复旦附中学生 ID 授权第三方应用</Card.Description>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <Typography type="body-sm" color="muted">
          当第三方应用请求访问你的账户时，会自动跳转到本页面。请确认应用信息与请求的权限后，再决定是否授权。
        </Typography>

        <Separator />

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LucideMonitorSmartphone className="text-muted size-4" aria-hidden />
            <Typography type="h4" className="m-0 text-sm font-medium">
              设备授权
            </Typography>
          </div>
          <Typography type="body-xs" color="muted">
            在电视、游戏机或其他不便输入账号的设备上登录时，输入设备屏幕上显示的授权码。
          </Typography>
        </div>

        <TextField name="user_code">
          <Label>设备授权码</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <LucideKeyRound className="text-muted size-4" aria-hidden />
            </InputGroup.Prefix>
            <InputGroup.Input
              autoCapitalize="characters"
              autoComplete="off"
              className="font-mono tracking-widest"
              inputMode="text"
              maxLength={9}
              placeholder="ABCD-EFGH"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(formatUserCodeInput(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
            />
          </InputGroup>
        </TextField>

        <Typography type="body-xs" color="muted">
          授权码格式为 ABCD-EFGH，可在设备屏幕上找到。
        </Typography>
        <Typography type="body-xs" color="muted">
          OAuth 应用授权链接由应用自动生成并打开，通常无需手动填写授权码。
        </Typography>
      </Card.Content>
      <Card.Footer className="mt-2">
        <Button className="w-full" isDisabled={!isValid} onPress={submit}>
          继续
        </Button>
      </Card.Footer>
    </>
  );
}

export default function OAuthRequest() {
  const { search } = useLocation();
  const request = useMemo(() => parseOAuthRequest(search), [search]);

  let content;
  if (request.userCode) {
    content = <DeviceAuthorization userCode={request.userCode} />;
  } else if (request.clientID) {
    content = <AuthorizationConsent request={request} />;
  } else {
    content = <DeviceCodeLanding />;
  }

  return (
    <>
      <Helmet>
        <title>应用授权 - 复旦附中学生 ID</title>
      </Helmet>
      {content}
    </>
  );
}
