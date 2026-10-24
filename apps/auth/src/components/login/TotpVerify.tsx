import {Button, Card, InputOTP, Link, Typography} from "@heroui/react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "@heroui/react/input-otp";
import { useState } from "react";
import clsx from "clsx";

interface Props {
  loading?: boolean;
  onSubmit: (code: string) => void;
  onBack: () => void;
}

function TotpVerify({ loading, onSubmit, onBack }: Props) {
  const [code, setCode] = useState("");

  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>TOTP 验证</Card.Title>
        <Card.Description>请输入你的 TOTP 代码以完成登录</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="w-100 max-w-full">
          <InputOTP
              maxLength={6}
              variant="secondary"
              value={code}
              onChange={(c) => setCode(c.toUpperCase())}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              className="w-auto mx-auto"
          >
            <InputOTP.Group>
              <InputOTP.Slot index={0} />
              <InputOTP.Slot index={1} />
              <InputOTP.Slot index={2} />
            </InputOTP.Group>
            <InputOTP.Separator />
            <InputOTP.Group>
              <InputOTP.Slot index={3} />
              <InputOTP.Slot index={4} />
              <InputOTP.Slot index={5} />
            </InputOTP.Group>
          </InputOTP>
        </div>
      </Card.Content>
      <Card.Footer className="mt-2 flex justify-between gap-2">
        <Button className="w-full" variant="tertiary" onPress={onBack}>
          返回
        </Button>
        <Button
          className="w-full"
          isDisabled={code.length < 6}
          isPending={loading}
          onPress={() => onSubmit(code)}
        >
          验证
        </Button>
      </Card.Footer>
    </>
  );
}

export default TotpVerify;
