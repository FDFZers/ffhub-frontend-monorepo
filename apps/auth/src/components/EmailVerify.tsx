import { Button, Card, CloseButton, InputOTP, Link, Typography } from "@heroui/react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "@heroui/react/input-otp";
import clsx from "clsx";
import { LucideUndo2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  loading?: boolean;
  onSubmit: (code: string) => void;
  onBack: () => void;
  onSend: () => void;
}

const RESEND_SECONDS = 120;

function LoginEmailVerify({ loading, onSubmit, onBack, onSend }: Props) {
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [remain, setRemain] = useState(0);

  useEffect(() => {
    if (remain <= 0) return;
    const t = window.setInterval(() => setRemain((v) => v - 1), 1000);
    return () => window.clearInterval(t);
  }, [remain]);

  const handleSend = () => {
    if (remain > 0) return;
    setSent(true);
    setRemain(RESEND_SECONDS);
    onSend();
  };

  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>邮箱验证</Card.Title>
        <Card.Description>
          请验证你的邮箱以完成登录
        </Card.Description>
        <CloseButton className="absolute top-3 right-3" onPress={onBack}>
          <LucideUndo2 />
        </CloseButton>
      </Card.Header>
      <Card.Content>
        <div className="flex w-80 max-w-full flex-col">
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
          <Typography type="body-sm" color="muted" className="mt-2">
            {!sent ? (
              <>
                请点击此处以{" "}
                <Link className="underline" onClick={handleSend}>
                  获取验证码
                </Link>
              </>
            ) : (
              <>
                没有收到验证码？
                <Link
                  className={clsx("underline", remain > 0 ? "text-muted pointer-events-none" : "")}
                  onClick={handleSend}
                >
                  重新发送{remain > 0 && ` (${remain}s)`}
                </Link>
              </>
            )}
          </Typography>
        </div>
      </Card.Content>
      <Card.Footer>
        <Button
          className="w-full"
          isPending={loading}
          isDisabled={code.length !== 6}
          onPress={() => onSubmit(code)}
        >
          验证
        </Button>
      </Card.Footer>
    </>
  );
}

export default LoginEmailVerify;
