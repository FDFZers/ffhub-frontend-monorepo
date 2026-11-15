import type { PasswordResetMethod } from "@repo/shared/api/auth/types.ts";

import { toast } from "@heroui/react";
import {
  passwordResetFinalize,
  passwordResetInitEmail,
  passwordResetInitQQ,
  verifyEmail,
  verifyEmailInit,
  verifyQQ,
  verifyQQInit,
} from "@repo/shared/api/auth/api.ts";
import { useCallback, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router";

import EmailCodeVerify from "../components/EmailCodeVerify.tsx";
import QQCodeVerify from "../components/QQCodeVerify.tsx";
import Identifier from "../components/reset_password/Identifier.tsx";
import Method from "../components/reset_password/Method.tsx";
import NewPassword from "../components/reset_password/NewPassword.tsx";
import Success from "../components/reset_password/Success.tsx";
type Step =
  | { kind: "method" }
  | { kind: "identifier" }
  | { kind: "email" }
  | { kind: "qq"; code: string }
  | { kind: "password" }
  | { kind: "success" };

const QQ_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** 服务端对未绑定 QQ 的账号不返回验证码，本地生成占位验证码以保持防枚举行为一致。 */
function generatePlaceholderQQCode(): string {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += QQ_CODE_CHARS.charAt(Math.floor(Math.random() * QQ_CODE_CHARS.length));
  }
  return code;
}

export default function ResetPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>({ kind: "method" });
  const [sessionID, setSessionID] = useState<string | null>(null);
  const [method, setMethod] = useState<PasswordResetMethod>("email");
  const [loading, setLoading] = useState(false);

  const backToLogin = useCallback(() => navigate("/login"), [navigate]);

  /** 回到找回方式选择页，并清空当前验证会话。 */
  const restart = useCallback(() => {
    setStep({ kind: "method" });
    setSessionID(null);
    setLoading(false);
  }, []);

  /** 从验证码页返回上一步，保留已选择的找回方式。 */
  const backToIdentifier = useCallback(() => {
    setStep({ kind: "identifier" });
    setSessionID(null);
    setLoading(false);
  }, []);

  const handleSelectMethod = useCallback((m: PasswordResetMethod) => {
    setMethod(m);
    setSessionID(null);
    setStep({ kind: "identifier" });
  }, []);

  const handleMethodSubmit = useCallback(
    async (m: PasswordResetMethod, identifier: string, altchaPayload: string) => {
      setLoading(true);
      try {
        const res =
          m === "email"
            ? await passwordResetInitEmail(identifier, altchaPayload)
            : await passwordResetInitQQ(identifier, altchaPayload);

        if (m === "email") {
          setSessionID(res.session_id);
          setMethod(m);
          setStep({ kind: "email" });
        } else {
          // 后端 QQ init 幂等：重复调用会返回同一验证码；未绑定 QQ 的账号仍返回空对象以保持防枚举。
          const init = await verifyQQInit(res.session_id);
          const code = init.code ?? generatePlaceholderQQCode();
          setSessionID(res.session_id);
          setMethod(m);
          setStep({ kind: "qq", code });
        }
      } catch (e: unknown) {
        console.error("[FFHub Auth] 找回密码初始化失败", e);
        toast.danger("找回密码失败", {
          description: e instanceof Error ? e.message : "找回密码失败",
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleEmailSend = useCallback(async () => {
    if (!sessionID) throw new Error("找回密码会话已失效，请重新开始");
    try {
      await verifyEmailInit(sessionID);
    } catch (e: unknown) {
      console.error("[FFHub Auth] 密码重置验证码发送失败", e);
      const code = (e as { code?: string } | null)?.code;
      const message = e instanceof Error ? e.message : "验证码发送失败";
      if (message.includes("二次验证已通过")) {
        // 验证已经通过但响应丢失，直接进入设置新密码步骤。
        setStep({ kind: "password" });
        return;
      }
      if (code === "not_found") {
        toast.danger("找回密码会话已过期", { description: message });
        restart();
        return;
      }
      throw new Error(message);
    }
  }, [sessionID, restart]);

  const handleEmailSubmit = useCallback(
    async (code: string) => {
      if (!sessionID) return;
      setLoading(true);
      try {
        await verifyEmail(sessionID, code);
        setStep({ kind: "password" });
      } catch (e: unknown) {
        console.error("[FFHub Auth] 邮箱验证失败", e);
        const code = (e as { code?: string } | null)?.code;
        const message = e instanceof Error ? e.message : "验证失败";
        if (message.includes("二次验证已通过")) {
          setStep({ kind: "password" });
          return;
        }
        if (code === "not_found") {
          toast.danger("找回密码会话已过期", { description: message });
          restart();
          return;
        }
        if (code === "rate_limit_exceeded" && message.includes("次数过多")) {
          toast.danger("邮箱验证失败", { description: message });
          restart();
          return;
        }
        toast.danger("邮箱验证失败", { description: message });
      } finally {
        setLoading(false);
      }
    },
    [sessionID, restart],
  );

  const handleQQVerify = useCallback(
    async (code: string, silent = false) => {
      if (!sessionID) return;
      if (!silent) {
        setLoading(true);
      }
      try {
        await verifyQQ(sessionID, code);
        setStep({ kind: "password" });
      } catch (e: unknown) {
        if (!silent) console.error("[FFHub Auth] QQ 验证失败", e);
        const code = (e as { code?: string } | null)?.code;
        const message = e instanceof Error ? e.message : "QQ 验证失败";
        if (message.includes("二次验证已通过")) {
          setStep({ kind: "password" });
          return;
        }
        if (code === "not_found") {
          toast.danger("找回密码会话已过期", { description: message });
          restart();
          return;
        }
        if (code === "rate_limit_exceeded" && message.includes("次数过多")) {
          toast.danger("QQ 验证失败", { description: message });
          restart();
          return;
        }
        if (!silent) {
          toast.danger("QQ 验证失败", { description: message });
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [sessionID, restart],
  );

  const handleFinalize = useCallback(
    async (password: string) => {
      if (!sessionID) {
        toast.danger("找回密码会话已失效，请重新开始");
        restart();
        return;
      }
      setLoading(true);
      try {
        await passwordResetFinalize(sessionID, password);
        setSessionID(null);
        setStep({ kind: "success" });
      } catch (e: unknown) {
        console.error("[FFHub Auth] 密码重置失败", e);
        const code = (e as { code?: string } | null)?.code;
        const message = e instanceof Error ? e.message : "密码重置失败";
        if (code === "not_found") {
          toast.danger("找回密码会话已过期", { description: message });
          restart();
          return;
        }
        toast.danger("密码重置失败", { description: message });
      } finally {
        setLoading(false);
      }
    },
    [sessionID, restart],
  );

  return (
    <>
      <Helmet>
        <title>找回密码 - 复旦附中学生 ID</title>
      </Helmet>
      {step.kind === "method" && <Method onSelect={handleSelectMethod} onBack={backToLogin} />}
      {step.kind === "identifier" && (
        <Identifier
          method={method}
          loading={loading}
          onSubmit={(identifier, altchaPayload) =>
            handleMethodSubmit(method, identifier, altchaPayload)
          }
          onBack={restart}
          onExit={backToLogin}
        />
      )}
      {step.kind === "email" && (
        <EmailCodeVerify
          title="邮箱验证"
          description="请输入发送到绑定邮箱的验证码"
          resendSeconds={60}
          loading={loading}
          onSend={handleEmailSend}
          onSubmit={handleEmailSubmit}
          onBack={backToIdentifier}
        />
      )}
      {step.kind === "qq" && (
        <QQCodeVerify
          code={step.code}
          loading={loading}
          onVerify={(silent) => handleQQVerify(step.code, silent)}
          onBack={backToIdentifier}
        />
      )}
      {step.kind === "password" && (
        <NewPassword
          description={
            method === "email"
              ? "邮箱验证已通过，请设置新的登录密码"
              : "QQ 验证已通过，请设置新的登录密码"
          }
          loading={loading}
          onSubmit={handleFinalize}
          onBack={backToLogin}
        />
      )}
      {step.kind === "success" && <Success onBack={backToLogin} />}
    </>
  );
}
