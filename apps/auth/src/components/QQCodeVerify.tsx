import { Card, CloseButton, Spinner, Surface, toast, Typography } from "@heroui/react";
import Tooltip from "@repo/shared/components/Tooltip.tsx";
import { LucideUndo2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

/** 自动轮询间隔。 */
const POLL_INTERVAL_MS = 5_000;

interface Props {
  code: string;
  loading?: boolean;
  onVerify: () => void | Promise<void>;
  onBack: () => void;
}

function QQCodeVerify({ code, onVerify, onBack }: Props) {
  const inFlightRef = useRef(false);
  const onVerifyRef = useRef(onVerify);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  const triggerVerify = useCallback(() => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    void Promise.resolve(onVerifyRef.current()).finally(() => {
      inFlightRef.current = false;
    });
  }, []);

  // 每 5 秒自动检测一次，成功后会由父组件切走页面。
  useEffect(() => {
    const timer = window.setInterval(triggerVerify, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [triggerVerify]);

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
        <Card.Description>
          请<strong>点击下方复制</strong>验证码并 QQ 私信发送给 FFHub 机器人
        </Card.Description>
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
          <Tooltip.Content>点击以复制验证码</Tooltip.Content>
        </Tooltip>
      </Card.Content>
      <Card.Footer className="mt-2">
        <div
          aria-live="polite"
          className="text-muted flex w-full flex-col items-center justify-center gap-2"
        >
          <div className="flex items-center gap-2 text-sm">
            <Spinner size="sm" />
            <span>等待中…</span>
          </div>
        </div>
      </Card.Footer>
    </>
  );
}

export default QQCodeVerify;
