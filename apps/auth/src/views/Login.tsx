import type { TwoFactorMethod } from "@repo/shared/api/auth/types.ts";

import { toast } from "@heroui/react";
import {
  loginFinalize,
  loginInit,
  type LoginInitBannedResponse,
  verifyEmail,
  verifyEmailInit,
  verifyQQ,
  verifyQQInit,
  verifyTOTP,
} from "@repo/shared/api/auth/api.ts";
import { getIPInfo } from "@repo/shared/api/misc/api.ts";
import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";

import EmailCodeVerify from "../components/EmailCodeVerify.tsx";
import Banned from "../components/login/Banned.tsx";
import PasswordVerify from "../components/login/PasswordVerify.tsx";
import SchoolIP from "../components/login/SchoolIP.tsx";
import Select2FA from "../components/login/Select2FA.tsx";
import TotpVerify from "../components/login/TotpVerify.tsx";
import NewPassword from "../components/reset_password/NewPassword.tsx";
import QQCodeVerify from "../components/QQCodeVerify.tsx";
import { resolvePostLoginURL } from "../utils/redirect.ts";

type Step =
  | { kind: "school-ip"; label: string }
  | { kind: "credentials" }
  | { kind: "banned"; ban: LoginInitBannedResponse }
  | { kind: "select-2fa"; methods: TwoFactorMethod[] }
  | { kind: "email-verify" }
  | { kind: "totp" }
  | { kind: "qq"; code: string }
  | { kind: "reset-password" };

export default function Login() {
  const [step, setStep] = useState<Step>({ kind: "credentials" });
  const [sessionID, setSessionID] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<TwoFactorMethod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const info = await getIPInfo();
        const label = info.type;
        if (cancelled || !label) return;
        setStep((current) =>
          current.kind === "credentials" ? { kind: "school-ip", label } : current,
        );
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reset = useCallback(() => {
    setSessionID(null);
    setAvailableMethods([]);
    setStep({ kind: "credentials" });
    setLoading(false);
  }, []);

  const finalize = useCallback(
    async (sid: string, password?: string): Promise<boolean> => {
      setLoading(true);
      try {
        try {
          await loginFinalize(sid, password);
        } catch (e: unknown) {
          console.error("[FFHub Auth] 登录最终确认失败", e);
          const code = (e as { code?: string } | null)?.code;
          const message = e instanceof Error ? e.message : "登录失败";
          if (code === "password_reset_required") {
            // 管理员重置过密码：保留鉴权会话，切到设置新密码步骤后重新 finalize。
            setSessionID(sid);
            setStep({ kind: "reset-password" });
            return false;
          }
          if (code === "not_found") {
            toast.danger("登录会话已失效", { description: message });
            reset();
            return false;
          }
          toast.danger(password === undefined ? "登录失败" : "密码设置失败", {
            description: message,
          });
          return false;
        }

        // 登录已经成功（Cookie 已写入），直接跳转，后续令牌校验由目标应用完成。
        window.location.replace(resolvePostLoginURL(window.location.search));
        return true;
      } finally {
        setLoading(false);
      }
    },
    [reset],
  );

  const handleResetPassword = useCallback(
    (password: string) => {
      if (!sessionID) {
        toast.danger("登录会话已失效，请重新登录");
        reset();
        return;
      }
      void finalize(sessionID, password);
    },
    [finalize, reset, sessionID],
  );

  const enterQQ = useCallback(
    async (sid: string) => {
      setLoading(true);
      try {
        // 后端 QQ init 是幂等的：重复调用会返回同一验证码，所以每次进入该步骤都可以放心重新获取。
        const { code } = await verifyQQInit(sid);
        if (!code) {
          toast.danger("QQ 验证初始化失败", { description: "未获取到验证码，请重新登录" });
          reset();
          return;
        }
        setStep({ kind: "qq", code });
      } catch (e: unknown) {
        console.error("[FFHub Auth] QQ 验证初始化失败", e);
        const code = (e as { code?: string } | null)?.code;
        const message = e instanceof Error ? e.message : "QQ 验证初始化失败";
        if (message.includes("二次验证已通过")) {
          // 二次验证已通过但未完成登录（例如上一次 finalize 失败），直接重试 finalize。
          await finalize(sid);
          return;
        }
        if (code === "not_found") {
          toast.danger("登录会话已失效", { description: message });
          reset();
          return;
        }
        toast.danger("QQ 验证初始化失败", { description: message });
      } finally {
        setLoading(false);
      }
    },
    [finalize, reset],
  );

  const enterMethod = useCallback(
    async (method: TwoFactorMethod, sid: string) => {
      if (method === "email") {
        setStep({ kind: "email-verify" });
      } else if (method === "totp") {
        setStep({ kind: "totp" });
      } else if (method === "qq") {
        await enterQQ(sid);
      }
    },
    [enterQQ],
  );

  const backFromMethod = useCallback(() => {
    if (availableMethods.length > 1) {
      setStep({ kind: "select-2fa", methods: availableMethods });
    } else {
      reset();
    }
  }, [availableMethods, reset]);

  const handleCredentials = async (
    username: string,
    password: string,
    remember: boolean,
    altchaPayload: string,
  ) => {
    setLoading(true);
    try {
      const res = await loginInit({
        username,
        password,
        is_temporary: !remember,
        altcha_payload: altchaPayload,
      });

      if (res.banned) {
        // 凭据已验证但账号被封禁：展示独立封禁页，不再创建登录会话。
        setSessionID(null);
        setAvailableMethods([]);
        setStep({ kind: "banned", ban: res });
        return;
      }

      setSessionID(res.session_id);
      const methods = (res["2fa"] ?? []) as TwoFactorMethod[];
      setAvailableMethods(methods);

      if (res.passed || methods.length === 0) {
        await finalize(res.session_id);
      } else if (methods.length === 1) {
        await enterMethod(methods[0], res.session_id);
      } else {
        setStep({ kind: "select-2fa", methods });
      }
    } catch (e: unknown) {
      console.error("[FFHub Auth] 登录失败", e);
      const message = e instanceof Error ? e.message : "登录失败";
      toast.danger("登录失败", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = (method: TwoFactorMethod) => {
    if (!sessionID) return;
    void enterMethod(method, sessionID);
  };

  const handleEmailSend = async () => {
    if (!sessionID) throw new Error("登录会话已失效，请重新登录");
    try {
      await verifyEmailInit(sessionID);
    } catch (e: unknown) {
      console.error("[FFHub Auth] 登录验证码发送失败", e);
      const code = (e as { code?: string } | null)?.code;
      const message = e instanceof Error ? e.message : "验证码发送失败";
      if (message.includes("二次验证已通过")) {
        // 上一次验证已通过但 finalize 失败时，重新发送验证码没有意义，直接重试最终登录。
        await finalize(sessionID);
        return;
      }
      if (code === "not_found") {
        toast.danger("登录会话已失效", { description: message });
        reset();
        return;
      }
      throw new Error(message);
    }
  };

  const handleEmailVerify = async (code: string) => {
    if (!sessionID) return;
    setLoading(true);
    try {
      await verifyEmail(sessionID, code);
      await finalize(sessionID);
    } catch (e: unknown) {
      console.error("[FFHub Auth] 邮箱验证失败", e);
      const code = (e as { code?: string } | null)?.code;
      const message = e instanceof Error ? e.message : "验证失败";
      if (message.includes("二次验证已通过")) {
        // 二次验证已通过，但最终登录未完成（例如刚才 finalize 网络失败），直接重试。
        await finalize(sessionID);
        return;
      }
      if (code === "not_found") {
        toast.danger("登录会话已失效", { description: message });
        reset();
        return;
      }
      if (code === "rate_limit_exceeded" && message.includes("次数过多")) {
        toast.danger("邮箱验证失败", { description: message });
        reset();
        return;
      }
      toast.danger("邮箱验证失败", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleQQVerify = async (code: string) => {
    if (!sessionID) return;
    try {
      await verifyQQ(sessionID, code);
      await finalize(sessionID);
    } catch (e: unknown) {
      console.warn("[FFHub Auth] QQ 验证未通过", e);
      const code = (e as { code?: string } | null)?.code;
      const message = e instanceof Error ? e.message : "QQ 验证失败";
      if (message.includes("二次验证已通过")) {
        await finalize(sessionID);
        return;
      }
      if (code === "not_found") {
        toast.danger("登录会话已失效", { description: message });
        reset();
        return;
      }
      if (code === "rate_limit_exceeded" && message.includes("次数过多")) {
        toast.danger("QQ 验证失败", { description: message });
        reset();
      }
    }
  };

  const handleTotp = async (code: string) => {
    if (!sessionID) return;
    setLoading(true);
    try {
      await verifyTOTP(sessionID, code);
      await finalize(sessionID);
    } catch (e: unknown) {
      console.error("[FFHub Auth] TOTP 验证失败", e);
      const code = (e as { code?: string } | null)?.code;
      const message = e instanceof Error ? e.message : "验证失败";
      if (message.includes("二次验证已通过")) {
        await finalize(sessionID);
        return;
      }
      if (code === "not_found") {
        toast.danger("登录会话已失效", { description: message });
        reset();
        return;
      }
      if (code === "rate_limit_exceeded" && message.includes("次数过多")) {
        toast.danger("TOTP 验证失败", { description: message });
        reset();
        return;
      }
      toast.danger("TOTP 验证失败", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const pageTitle =
    step.kind === "banned"
      ? "账号封禁"
      : step.kind === "reset-password"
        ? "设置新密码"
        : "登录";

  return (
    <>
      <Helmet>
        <title>{pageTitle} - 复旦附中学生 ID</title>
      </Helmet>
      {step.kind === "school-ip" && (
        <SchoolIP label={step.label} onSubmit={() => setStep({ kind: "credentials" })} />
      )}
      {step.kind === "credentials" && (
        <PasswordVerify loading={loading} onSubmit={handleCredentials} />
      )}
      {step.kind === "banned" && <Banned ban={step.ban} onBack={reset} />}
      {step.kind === "select-2fa" && (
        <Select2FA
          methods={step.methods}
          loading={loading}
          onSelect={handleSelectMethod}
          onBack={reset}
        />
      )}
      {step.kind === "email-verify" && (
        <EmailCodeVerify
          title="邮箱验证"
          description="请验证你的邮箱以完成登录"
          submitLabel="验证"
          resendSeconds={60}
          loading={loading}
          onSend={handleEmailSend}
          onSubmit={handleEmailVerify}
          onBack={backFromMethod}
        />
      )}
      {step.kind === "totp" && (
        <TotpVerify loading={loading} onSubmit={handleTotp} onBack={backFromMethod} />
      )}
      {step.kind === "qq" && (
        <QQCodeVerify
          code={step.code}
          loading={loading}
          onVerify={() => handleQQVerify(step.code)}
          onBack={backFromMethod}
        />
      )}
      {step.kind === "reset-password" && (
        <NewPassword
          description="管理员已重置你的密码，请设置新密码后继续登录。"
          loading={loading}
          onSubmit={handleResetPassword}
          onBack={reset}
        />
      )}
    </>
  );
}
