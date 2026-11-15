import { Card, Link, Surface, toast, Typography } from "@heroui/react";
import Tooltip from "@repo/shared/components/Tooltip.tsx";
import { LucideCircleCheck } from "lucide-react";

interface Props {
  id: string;
}

function Success({ id }: Props) {
  const copyID = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("注册申请 ID 已复制");
    } catch (e: unknown) {
      console.error("[FFHub Auth] 复制注册申请 ID 失败", e);
      toast.danger("复制失败", { description: "请手动选择下方的 ID 复制" });
    }
  };

  return (
    <>
      <Card.Content className="flex w-120 max-w-full flex-col items-center gap-4 p-8">
        <LucideCircleCheck className="text-success size-24" />
        <Typography type="h1">注册申请提交成功</Typography>
        <p className="text-muted text-center text-sm">
          我们将在 7 天内审核您的注册申请。
          <br />
          你可以使用下方的 ID 查询
          <Link href={`/reg_status?id=${encodeURIComponent(id)}`} target="_blank">
            注册申请审批状态
          </Link>
          。
          <br />
          ID 将在关闭此标签页后消失，请<strong>点击下方复制</strong>并妥善保管！
        </p>
        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <Surface
              className="group hover:bg-background-tertiary flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl p-6 transition-all"
              variant="secondary"
              onClick={copyID}
            >
              <p className="decoration-muted font-mono break-all underline-offset-2 group-hover:underline">
                {id}
              </p>
            </Surface>
          </Tooltip.Trigger>
          <Tooltip.Content placement="bottom">点击以复制 ID</Tooltip.Content>
        </Tooltip>
      </Card.Content>
    </>
  );
}

export default Success;
