import { Card, CloseButton, Spinner, Surface, Typography } from "@heroui/react";
import { LucideUndo2 } from "lucide-react";

interface Props {
  code: string;
  onBack: () => void;
}

function QQVerify({ code, onBack }: Props) {
  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>QQ 验证</Card.Title>
        <Card.Description>请将以下代码通过私信发送给机器人</Card.Description>
        <CloseButton className="absolute top-3 right-3" onPress={onBack}>
          <LucideUndo2 />
        </CloseButton>
      </Card.Header>
      <Card.Content className="flex w-100 max-w-full justify-center">
        <Surface className="flex w-full justify-center rounded-3xl p-6" variant="secondary">
          <Typography type="h1" className="font-mono tracking-widest">
            {code}
          </Typography>
        </Surface>
      </Card.Content>
      <Card.Footer className="mt-1 flex justify-center gap-2">
        <Spinner color="accent" />
        <Typography type="body-sm" color="muted">
          等待机器人响应...
        </Typography>
      </Card.Footer>
    </>
  );
}

export default QQVerify;
