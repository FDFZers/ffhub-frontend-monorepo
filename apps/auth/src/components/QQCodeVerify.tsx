import { Button, Card, CloseButton, Surface, toast, Typography } from "@heroui/react";
import Tooltip from "@repo/shared/components/Tooltip.tsx";
import { LucideUndo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/** 自动轮询间隔。 */
const POLL_INTERVAL_MS = 10_000;
/** 服务端对同一 QQ 的拉取有频率限制，两次验证至少间隔 5 秒。 */
const ATTEMPT_THROTTLE_MS = 5_000;

interface Props {
  code: string;
  loading?: boolean;
  /** silent 为 true 时表示自动轮询，父组件不应展示普通失败。 */
  onVerify: (silent?: boolean) => void | Promise<void>;
  onBack: () => void;
}

function QQCodeVerify({ code, loading, onVerify, onBack }: Props) {
  const [verifying, setVerifying] = useState(false);
  const verifyTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const lastAttemptRef = useRef(0);
  const onVerifyRef = useRef(onVerify);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    return () => {
      if (verifyTimerRef.current !== null) window.clearTimeout(verifyTimerRef.current);
    };
  }, []);

  const triggerVerify = useCallback((silent: boolean) => {
    if (inFlightRef.current) return;
    const now = Date.now();
    if (now - lastAttemptRef.current < ATTEMPT_THROTTLE_MS) return;

    lastAttemptRef.current = now;
    inFlightRef.current = true;
    void Promise.resolve(onVerifyRef.current(silent)).finally(() => {
      inFlightRef.current = false;
    });
  }, []);

  // 每 10 秒自动检测一次，成功后会由父组件切走页面。
  useEffect(() => {
    const timer = window.setInterval(() => triggerVerify(true), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [triggerVerify]);

  const handleManualVerify = () => {
    setVerifying(true);
    if (verifyTimerRef.current !== null) window.clearTimeout(verifyTimerRef.current);
    verifyTimerRef.current = window.setTimeout(() => {
      verifyTimerRef.current = null;
      setVerifying(false);
    }, ATTEMPT_THROTTLE_MS);
    triggerVerify(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("验证码已复制");
    } catch (e: unknown) {
      console.error("[FFHub Auth] 复制验证码失败", e);
      toast.danger("复制失败", { description: "请手动选择验证码复制" });
    }
  };

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>QQ 验证</Card.Title>
        <Card.Description>请使用 QQ 私信向 FFHub 机器人发送以下验证码：</Card.Description>
        <CloseButton className="absolute top-2 right-2" aria-label="返回" onPress={onBack}>
          <LucideUndo2 />
        </CloseButton>
      </Card.Header>
      <Card.Content className="flex w-100 max-w-full flex-col gap-4">
        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <Surface
              className="group hover:bg-background-tertiary flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl p-6 transition-all"
              variant="secondary"
              onClick={handleCopy}
            >
              <Typography
                type="h1"
                className="decoration-muted font-mono tracking-widest break-all underline-offset-4 group-hover:underline"
              >
                {code}
              </Typography>
            </Surface>
          </Tooltip.Trigger>
          <Tooltip.Content>点击以复制 ID</Tooltip.Content>
        </Tooltip>
      </Card.Content>
      <Card.Footer className="mt-2 flex flex-col gap-2">
        <Button
          className="w-full"
          isPending={verifying || loading}
          isDisabled={verifying || loading}
          onPress={handleManualVerify}
        >
          {verifying || loading ? "验证中…" : "我已发送验证码"}
        </Button>
      </Card.Footer>
    </>
  );
}

export default QQCodeVerify;
