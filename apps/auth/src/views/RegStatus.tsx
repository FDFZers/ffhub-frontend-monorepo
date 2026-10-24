import type { StatusResponse } from "@repo/commons/api/reg_req/api.ts";

import { toast } from "@heroui/react";
import { getStatus } from "@repo/commons/api/reg_req/api.ts";
import { useCallback, useState } from "react";
import { Helmet } from "react-helmet";

import Query from "../components/reg_status/Query.tsx";
import Result from "../components/reg_status/Result.tsx";

export default function RegStatus() {
  const [current, setCurrent] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useCallback(async (id: string, altchaPayload: string) => {
    setLoading(true);
    try {
      const result = await getStatus({ id, altcha_payload: altchaPayload });
      setCurrent(result);
    } catch (e: any) {
      console.error("[FFHub Auth] 注册申请状态查询失败", e);
      toast.danger("查询失败", { description: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const back = useCallback(() => setCurrent(null), []);

  return (
    <>
      <Helmet>
        <title>审批状态 - 复旦附中学生 ID</title>
      </Helmet>
      {current ? (
        <Result result={current} onBack={back} />
      ) : (
        <Query loading={loading} onSubmit={query} />
      )}
    </>
  );
}
