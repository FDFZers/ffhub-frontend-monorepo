import { Card, Typography } from "@heroui/react";
import { LucideCircleCheck, LucideCircleX } from "lucide-react";

interface OAuthResultCardProps {
  status: "approved" | "denied";
}

/** 设备授权完成后的结果页：大图标 + 可关闭页面提示。 */
export default function OAuthResultCard({ status }: OAuthResultCardProps) {
  const approved = status === "approved";
  const Icon = approved ? LucideCircleCheck : LucideCircleX;

  return (
    <Card.Content className="flex w-sm max-w-full flex-col items-center gap-4 p-4 text-center">
      <Icon className={approved ? "text-success size-24" : "text-danger size-24"} />
      <div className="flex flex-col items-center justify-center gap-2">
        <Typography type="h3">{approved ? "授权成功" : "已拒绝授权"}</Typography>
        <Typography type="body-sm" color="muted">
          {approved ? "现在可以关闭此页面，返回设备继续操作" : "现在可以关闭此页面"}
        </Typography>
      </div>
    </Card.Content>
  );
}
