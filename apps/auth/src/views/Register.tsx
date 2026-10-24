import type { School } from "@repo/commons/api/user/types.ts";

import { toast } from "@heroui/react";
import { register } from "@repo/commons/api/auth/api.ts";
import { useCallback, useState } from "react";
import { Helmet } from "react-helmet";

import Identity from "../components/register/Identity.tsx";
import Password from "../components/register/Password.tsx";
import Proof from "../components/register/Proof.tsx";
import SchoolForm from "../components/register/School.tsx";
import Username from "../components/register/Username.tsx";
import Verify from "../components/register/Verify.tsx";
import Success from "../components/register/Success.tsx";

export default function Register() {
  const [step, setStep] = useState(0);

  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState<School>("fdfz");
  const [realName, setRealName] = useState("");
  const [studentNum, setStudentNum] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [id, setId] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const submit = useCallback(
    async (altchaPayload: string) => {
      setLoading(true);
      try {
        const id = await register({
          username,
          nickname,
          type: "student",
          password,
          school,
          student_num: studentNum,
          real_name: realName,
          proof_image: proofImage!,
          altcha_payload: altchaPayload,
        });
        setId(id);
        setStep(6);
      } catch (e: any) {
        console.error("[FFHub Auth] 注册申请提交失败", e);
        toast.danger("注册申请提交失败", { description: e.message });
      } finally {
        setLoading(false);
      }
    },
    [username, nickname, password, school, realName, studentNum, proofImage, setId, setStep],
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
        <SchoolForm
          initial={school}
          onNext={(s) => {
            setSchool(s);
            setStep(3);
          }}
          onBack={back}
        />
      )}
      {step === 3 && (
        <Identity
          initial={{ realName, studentNum }}
          onNext={(v) => {
            setRealName(v.realName);
            setStudentNum(v.studentNum);
            setStep(4);
          }}
          onBack={back}
        />
      )}
      {step === 4 && (
        <Proof
          initial={proofImage}
          onNext={(p) => {
            setProofImage(p);
            setStep(5);
          }}
          onBack={back}
        />
      )}
      {step === 5 && (
        <Verify loading={loading} onSubmit={(payload) => submit(payload)} onBack={back} />
      )}
      {step === 6 && (
          <Success id={id}/>
      )}
    </>
  );
}
