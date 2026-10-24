import { Button, Card, Chip } from "@heroui/react";
import { useState } from "react";

import Altcha from "../Altcha.tsx";

interface Props {
  loading?: boolean;
  onSubmit: (altchaPayload: string) => void;
  onBack: () => void;
}

function Verify({ loading, onSubmit, onBack }: Props) {
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const isAltchaValid = altchaPayload !== null;

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>人机验证</Card.Title>
        <Card.Description>完成人机验证以提交注册信息</Card.Description>
        <Chip className="absolute top-0 right-0">6 / 6</Chip>
      </Card.Header>
      <Card.Content className="w-100">
          <Altcha onPayload={setAltchaPayload} />
      </Card.Content>
      <Card.Footer className="mt-4 flex flex-col gap-2">
        <div className="flex w-full justify-between gap-2">
          <Button className="w-full" variant="tertiary" isDisabled={loading} onPress={onBack}>
            上一步
          </Button>
          <Button
            className="w-full"
            isDisabled={!isAltchaValid || loading}
            isPending={loading}
            onPress={() => onSubmit(altchaPayload!)}
          >
            提交注册申请
          </Button>
        </div>
      </Card.Footer>
    </>
  );
}

export default Verify;
