import { Button, Card, CloseButton, InputOTP, Link, toast, Typography } from "@heroui/react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "@heroui/react/input-otp";
import clsx from "clsx";
import { LucideUndo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  description: string;
  submitLabel?: string;
  resendSeconds?: number;
  autoSend?: boolean;
  loading?: boolean;
  onSend: () => Promise<void>;
  onSubmit: (code: string) => void;
  onBack: () => void;
}

function EmailCodeVerify({
  title,
  description,
  submitLabel = "验证",
  resendSeconds = 60,
  autoSend = false,
  loading,
  onSend,
  onSubmit,
  onBack,
}: Props) {
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [remain, setRemain] = useState(0);

  const sendingRef = useRef(false);
  const autoSentRef = useRef(false);

  useEffect(() => {
    if (remain <= 0) return;
    const t = window.setInterval(() => setRemain((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(t);
  }, [remain]);

  const handleSend = useCallback(async () => {
    if (sendingRef.current || remain > 0) return;
    sendingRef.current = true;
    setSending(true);
    try {
      await onSend();
      // 重新发送后旧验证码立即失效，清空输入避免误提交浪费尝试次数。
      setCode("");
      setSent(true);
      setRemain(resendSeconds);
    } catch (e: unknown) {
      console.error("[FFHub Auth] 验证码发送失败", e);
      toast.danger("验证码发送失败", {
        description: e instanceof Error ? e.message : "验证码发送失败",
      });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [onSend, remain, resendSeconds]);

  useEffect(() => {
    if (!autoSend || autoSentRef.current) return;
    autoSentRef.current = true;
    void handleSend();
  }, [autoSend, handleSend]);

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
        <CloseButton className="absolute top-2 right-2" aria-label="返回" onPress={onBack}>
          <LucideUndo2 />
        </CloseButton>
      </Card.Header>
      <Card.Content className="flex w-100 max-w-full flex-col">
        <InputOTP
          maxLength={6}
          variant="secondary"
          value={code}
          onChange={(c) => setCode(c.toUpperCase())}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          className="mx-auto w-auto"
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
            sending ? (
              <>正在发送验证码…</>
            ) : (
              <>
                请点击此处以{" "}
                <Link className="underline" onPress={handleSend}>
                  获取验证码
                </Link>
              </>
            )
          ) : (
            <>
              没有收到验证码？
              <Link
                className={clsx("underline", remain > 0 ? "text-muted pointer-events-none" : "")}
                onPress={handleSend}
              >
                {sending ? "发送中…" : "重新发送"}
                {remain > 0 && ` (${remain}s)`}
              </Link>
            </>
          )}
        </Typography>
      </Card.Content>
      <Card.Footer className="mt-2">
        <Button
          className="w-full"
          isPending={loading}
          isDisabled={code.length !== 6 || sending}
          onPress={() => onSubmit(code)}
        >
          {submitLabel}
        </Button>
      </Card.Footer>
    </>
  );
}

export default EmailCodeVerify;
