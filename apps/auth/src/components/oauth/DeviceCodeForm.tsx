import { Button, Card, InputOTP } from "@heroui/react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "@heroui/react/input-otp";
import { useState } from "react";
import { useNavigate } from "react-router";

import { isCompleteUserCode } from "../../utils/oauth.ts";

export default function DeviceCodeForm() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const formattedCode = code.length > 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
  const isValid = isCompleteUserCode(formattedCode);

  function submit() {
    if (!isValid) return;
    void navigate(`/oauth/device?user_code=${encodeURIComponent(formattedCode)}`);
  }

  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>设备授权</Card.Title>
        <Card.Description>请输入第三方应用内显示的授权码：</Card.Description>
      </Card.Header>

      <Card.Content
        className="flex max-w-full flex-col items-center gap-4"
        onKeyDown={(event) => {
          if (event.key === "Enter") submit();
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <InputOTP
            autoFocus
            aria-label="设备授权码"
            className="w-auto"
            maxLength={8}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={code}
            variant="secondary"
            onChange={(value) => setCode(value.toUpperCase())}
          >
            <InputOTP.Group>
              <InputOTP.Slot index={0} />
              <InputOTP.Slot index={1} />
              <InputOTP.Slot index={2} />
              <InputOTP.Slot index={3} />
            </InputOTP.Group>
            <InputOTP.Separator />
            <InputOTP.Group>
              <InputOTP.Slot index={4} />
              <InputOTP.Slot index={5} />
              <InputOTP.Slot index={6} />
              <InputOTP.Slot index={7} />
            </InputOTP.Group>
          </InputOTP>
        </div>
      </Card.Content>

      <Card.Footer className="mt-2">
        <Button className="w-full" isDisabled={!isValid} onPress={submit}>
          继续
        </Button>
      </Card.Footer>
    </>
  );
}
