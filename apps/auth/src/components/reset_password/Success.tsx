import { Button, Card, Typography } from "@heroui/react";
import { LucideCircleCheck } from "lucide-react";

interface Props {
  onBack: () => void;
}

function Success({ onBack }: Props) {
  return (
    <>
      <Card.Content className="flex w-120 max-w-full flex-col items-center gap-4 p-8">
        <LucideCircleCheck className="text-success size-24" />
        <Typography type="h1">密码重置成功</Typography>
        <p className="text-muted text-center text-sm">
          快去使用新密码重新登录复旦附中数字资源站吧！
        </p>
      </Card.Content>
      <Card.Footer className="mt-4">
        <Button className="w-full" onPress={onBack}>
          返回登录
        </Button>
      </Card.Footer>
    </>
  );
}

export default Success;
