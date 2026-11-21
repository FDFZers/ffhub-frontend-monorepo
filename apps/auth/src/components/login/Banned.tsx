import type { LoginInitBannedResponse } from "@repo/shared/api/auth/api.ts";

import { Button, Card, Separator, Surface, Typography } from "@heroui/react";
import { LucideBan } from "lucide-react";

import { formatDateTime } from "../../utils/datetime.ts";

interface Props {
  ban: LoginInitBannedResponse;
  onBack: () => void;
}

function Banned({ ban, onBack }: Props) {
  const endTime = ban.end_time ? formatDateTime(ban.end_time, true) : null;

  return (
    <>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <div className="flex flex-col items-center gap-1 p-2 text-center">
          <LucideBan aria-hidden className="text-danger size-20" strokeWidth={1.5} />
          <Typography type="h3" className="mt-1">
            账号已被封禁
          </Typography>
          <Typography color="muted" type="body-sm">
            请等待解封或联系管理员处理
          </Typography>
        </div>
        <Surface variant="secondary" className="flex flex-col gap-3 rounded-3xl p-5">
          <div className="flex items-start justify-between gap-3">
            <Typography color="muted" type="body-sm">
              封禁原因
            </Typography>
            <Typography className="text-right break-all" type="body-sm">
              {ban.reason || "未知"}
            </Typography>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <Typography color="muted" type="body-sm">
              解封时间
            </Typography>
            <Typography type="body-sm">{endTime ?? "永久封禁"}</Typography>
          </div>
        </Surface>
      </Card.Content>
      <Card.Footer className="mt-4">
        <Button className="w-full" variant="tertiary" onPress={onBack}>
          返回登录
        </Button>
      </Card.Footer>
    </>
  );
}

export default Banned;
