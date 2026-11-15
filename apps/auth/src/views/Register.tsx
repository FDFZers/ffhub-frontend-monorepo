import type { School, UserType } from "@repo/shared/api/user/types.ts";

import { toast } from "@heroui/react";
import { register } from "@repo/shared/api/auth/api.ts";
import { useCallback, useState } from "react";
import { Helmet } from "react-helmet";

import Identity from "../components/register/Identity.tsx";
import Password from "../components/register/Password.tsx";
import Proof from "../components/register/Proof.tsx";
import Submit from "../components/register/Submit.tsx";
import Success from "../components/register/Success.tsx";
import Username from "../components/register/Username.tsx";

/** 注册接口错误直接使用后端 message。 */
function describeRegisterError(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "注册申请提交失败，请稍后重试";
}

export default function Register() {
  const [step, setStep] = useState(0);

  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  // 用户类型暂不开放选择，固定为学生；后续可在此接入下拉选择。
  const type: UserType = "student";
  const [school, setSchool] = useState<School>("fdfz");
  const [realName, setRealName] = useState("");
  const [studentNum, setStudentNum] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [id, setId] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const back = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const submit = useCallback(
    async (altchaPayload: string) => {
      setLoading(true);
      try {
        const id = await register({
          username,
          nickname: nickname || undefined,
          type,
          password,
          school,
          student_num: type === "student" ? studentNum : undefined,
          real_name: realName,
          proof_image: proofImage!,
          altcha_payload: altchaPayload,
        });
        setId(id);
        setStep(5);
      } catch (e: unknown) {
        console.error("[FFHub Auth] 注册申请提交失败", e);
        const message = describeRegisterError(e);
        toast.danger("注册申请提交失败", { description: message });
      } finally {
        setLoading(false);
      }
    },
    [username, nickname, type, password, school, studentNum, realName, proofImage],
  );

  return (
    <>
      <Helmet>
        <title>注册 - 复旦附中学生 ID</title>
      </Helmet>
      {step === 0 && (
        <Username
          initial={{ username, nickname }}
          onNext={(v) => {
            setUsername(v.username);
            setNickname(v.nickname);
            setStep(1);
          }}
        />
      )}
      {step === 1 && (
        <Password
          initial={password}
          onNext={(p) => {
            setPassword(p);
            setStep(2);
          }}
          onBack={back}
        />
      )}
      {step === 2 && (
        <Identity
          type={type}
          initial={{ school, realName, studentNum }}
          onNext={(v) => {
            setSchool(v.school);
            setRealName(v.realName);
            setStudentNum(v.studentNum);
            setStep(3);
          }}
          onBack={back}
        />
      )}
      {step === 3 && (
        <Proof
          initial={proofImage}
          onNext={(p) => {
            setProofImage(p);
            setStep(4);
          }}
          onBack={back}
        />
      )}
      {step === 4 && (
        <Submit loading={loading} onSubmit={(payload) => submit(payload)} onBack={back} />
      )}
      {step === 5 && <Success id={id} />}
    </>
  );
}
