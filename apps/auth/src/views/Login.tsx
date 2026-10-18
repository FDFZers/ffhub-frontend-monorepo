import type { TwoFactorMethod } from "@repo/commons/api/auth/types";
import type { School } from "@repo/commons/api/user/types.ts";

import { toast } from "@heroui/react";
import {
  loginFinalize,
  loginInit,
  verifyEmail,
  verifyEmailInit,
  verifyTOTP,
} from "@repo/commons/api/auth/api";
import { getIPInfo } from "@repo/commons/api/misc/api";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import EmailVerify from "../components/EmailVerify.tsx";
import PasswordVerify from "../components/PasswordVerify.tsx";
import SchoolIP from "../components/SchoolIP.tsx";
import Select2FA from "../components/Select2FA.tsx";
import TotpVerify from "../components/TotpVerify.tsx";

type Step =
  | { kind: "checking" }
  | { kind: "school-ip"; school: School }
  | { kind: "credentials" }
  | { kind: "select-2fa"; methods: TwoFactorMethod[] }
  | { kind: "email-verify" }
  | { kind: "totp" }
  | { kind: "qq"; code: string };

export default function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>({ kind: "checking" });
  const [sessionID, setSessionID] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<TwoFactorMethod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const info = await getIPInfo();
        if (cancelled) return;
        setStep(
          info.type === "other"
            ? { kind: "credentials" }
            : { kind: "school-ip", school: info.type },
        );
      } catch {
        if (!cancelled) setStep({ kind: "credentials" });
      }
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
    async (sid: string) => {
      setLoading(true);
      try {
        await loginFinalize(sid);
        navigate("/", { replace: true });
      } catch (e: any) {
        toast.danger("登录失败", { description: e.message });
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  const enterMethod = useCallback((method: TwoFactorMethod, sid: string) => {
    if (method === "email") setStep({ kind: "email-verify" });
    else if (method === "totp") setStep({ kind: "totp" });
    else if (method === "qq") {
      // TODO: QQ
      setStep({ kind: "qq", code: sid.slice(0, 6) });
    }
  }, []);

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

      if (methods.length === 0) {
        await finalize(res.session_id);
      } else if (methods.length === 1) {
        enterMethod(methods[0], res.session_id);
      } else {
        setStep({kind: "select-2fa", methods});
      }
    } catch (e: any) {
      toast.danger("登录失败", {description: e.message});
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = (method: TwoFactorMethod) => {
    if (!sessionID) return;
    enterMethod(method, sessionID);
  };

  const handleEmailSend = async () => {
    if (!sessionID) return;
    setLoading(true);
    try {
      await verifyEmailInit(sessionID);
      setStep({ kind: "email-verify" });
    } catch (e: any) {
      toast.danger("验证码发送失败", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerify = async (code: string) => {
    if (!sessionID) return;
    setLoading(true);
    try {
      await verifyEmail(sessionID, code);
      await finalize(sessionID);
    } catch (e: any) {
      toast.danger("邮箱验证失败", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTotp = async (code: string) => {
    if (!sessionID) return;
    setLoading(true);
    try {
      await verifyTOTP(sessionID, code);
      await finalize(sessionID);
    } catch (e: any) {
      toast.danger("TOTP 验证失败", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {step.kind === "school-ip" && (
        <SchoolIP school={step.school} onSubmit={() => setStep({ kind: "credentials" })} />
      )}
      {step.kind === "credentials" && (
        <PasswordVerify loading={loading} onSubmit={handleCredentials} />
      )}
      {step.kind === "select-2fa" && (
        <Select2FA methods={step.methods} onSelect={handleSelectMethod} onBack={reset} />
      )}
      {step.kind === "email-verify" && (
        <EmailVerify
          loading={loading}
          onSubmit={handleEmailVerify}
          onBack={backFromMethod}
          onSend={handleEmailSend}
        />
      )}
      {step.kind === "totp" && (
        <TotpVerify loading={loading} onSubmit={handleTotp} onBack={backFromMethod} />
      )}
    </>
  );
}
