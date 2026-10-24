import { Card, Link, Surface, Typography } from "@heroui/react";
import { LucideCircleCheck } from "lucide-react";

interface Props {
  id: string;
}

function Success({ id }: Props) {
  return (
    <>
      <Card.Content className="flex w-120 flex-col items-center gap-4 p-8">
        <LucideCircleCheck className="text-success size-24" />
        <Typography type="h1">注册申请提交成功</Typography>
        <p className="text-muted text-center text-sm">
          我们将在 1-2 天内审核您的注册申请。
          <br />
          你可以使用下方的 ID 查询
          <Link href="/reg_status" target="_blank">
            注册申请审批状态
          </Link>
          。
          <br />
          ID 将在关闭此标签页后消失，请妥善保管！
        </p>
        <Surface className="flex w-full justify-center rounded-3xl p-6" variant="secondary">
          <p className="font-mono">{id}</p>
        </Surface>
      </Card.Content>
    </>
  );
}

export default Success;
