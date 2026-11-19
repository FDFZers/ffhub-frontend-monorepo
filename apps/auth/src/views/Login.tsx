import type { TwoFactorMethod } from "@repo/shared/api/auth/types.ts";

import { toast } from "@heroui/react";
import {
  loginFinalize,
  loginInit,
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
import PasswordVerify from "../components/login/PasswordVerify.tsx";
import SchoolIP from "../components/login/SchoolIP.tsx";
import Select2FA from "../components/login/Select2FA.tsx";
import TotpVerify from "../components/login/TotpVerify.tsx";
import QQCodeVerify from "../components/QQCodeVerify.tsx";
import { resolvePostLoginURL } from "../utils/redirect.ts";

type Step =
  | { kind: "school-ip"; label: string }
  | { kind: "credentials" }
  | { kind: "select-2fa"; methods: TwoFactorMethod[] }
  | { kind: "email-verify" }
  | { kind: "totp" }
  | { kind: "qq"; code: string };

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
    async (sid: string): Promise<boolean> => {
      setLoading(true);
      try {
        try {
          await loginFinalize(sid);
        } catch (e: unknown) {
          console.error("[FFHub Auth] 登录最终确认失败", e);
          const code = (e as { code?: string } | null)?.code;
          const message = e instanceof Error ? e.message : "登录失败";
          if (code === "not_found") {
            toast.danger("登录会话已失效", { description: message });
            reset();
            return false;
          }
          toast.danger("登录失败", { description: message });
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

  return (
    <>
      <Helmet>
        <title>登录 - 复旦附中学生 ID</title>
      </Helmet>
      {step.kind === "school-ip" && (
        <SchoolIP label={step.label} onSubmit={() => setStep({ kind: "credentials" })} />
      )}
      {step.kind === "credentials" && (
        <PasswordVerify loading={loading} onSubmit={handleCredentials} />
      )}
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
    </>
  );
}
