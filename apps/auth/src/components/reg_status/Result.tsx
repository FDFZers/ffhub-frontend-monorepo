import type { StatusResponse } from "@repo/commons/api/reg_req/api.ts";

import {Button, Card, Chip, Separator, Surface, Typography} from "@heroui/react";
import dayjs from "dayjs";
import { LucideCircleCheck, LucideCircleX, LucideClock } from "lucide-react";
import { useNavigate } from "react-router";

interface Props {
  result: StatusResponse;
  onBack: () => void;
}

const STATUS_META = {
  pending: {
    label: "审核中",
    title: "申请审核中",
    icon: LucideClock,
    iconClassName: "text-warning",
    chipColor: "warning",
  },
  approved: {
    label: "已通过",
    title: "审核已通过",
    icon: LucideCircleCheck,
    iconClassName: "text-success",
    chipColor: "success",
  },
  rejected: {
    label: "未通过",
    title: "审核未通过",
    icon: LucideCircleX,
    iconClassName: "text-danger",
    chipColor: "danger",
  },
} as const;

function Result({ result, onBack }: Props) {
  const navigate = useNavigate();

  const meta = STATUS_META[result.status];
  const Icon = meta.icon;
  const reviewedAt = result.reviewed_at
    ? dayjs(result.reviewed_at).format("YYYY-MM-DD HH:mm:ss")
    : null;
  const reviewComment = result.review_comment?.trim() || null;

  const primaryAction =
    result.status === "approved"
      ? { label: "前往登录", onPress: () => navigate("/login") }
      : result.status === "rejected"
        ? { label: "重新申请", onPress: () => navigate("/register") }
        : null;

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>审批状态</Card.Title>
        <Card.Description>你的注册申请审核结果如下</Card.Description>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <div className="flex flex-col items-center gap-1 px-2 py-2 text-center">
          <Icon aria-hidden className={`size-20 ${meta.iconClassName}`} strokeWidth={1.5} />
          <div className="mt-1 flex items-center gap-2">
            <Typography type="h3">{meta.title}</Typography>
            <Chip color={meta.chipColor} size="sm" variant="soft">
              {meta.label}
            </Chip>
          </div>
        </div>
        <Surface variant="secondary" className="flex flex-col gap-3 rounded-3xl p-5">
          {reviewedAt && (
            <>
              <div className="flex items-center justify-between gap-3">
                <Typography color="muted" type="body-sm">
                  审核时间
                </Typography>
                <Typography type="body-sm">{reviewedAt}</Typography>
              </div>
            </>
          )}
          {(reviewedAt && reviewComment) && (
              <Separator/>
          )}
          {reviewComment && (
            <>
              <div className="flex items-center justify-between gap-3">
                <Typography color="muted" type="body-sm">
                  审核留言
                </Typography>
                <Typography type="body-sm">{reviewComment}</Typography>
              </div>
            </>
          )}
        </Surface>
      </Card.Content>
      <Card.Footer className="mt-4 flex justify-between gap-2">
        <Button className="w-full" variant="tertiary" onPress={onBack}>
          返回查询
        </Button>
        {primaryAction && (
          <Button className="w-full" onPress={primaryAction.onPress}>
            {primaryAction.label}
          </Button>
        )}
      </Card.Footer>
    </>
  );
}

export default Result;
