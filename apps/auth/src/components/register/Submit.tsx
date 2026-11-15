import { Button, Card, Chip, Label } from "@heroui/react";
import { useRef, useState } from "react";

import Altcha, { type AltchaHandle } from "../Altcha.tsx";

interface Props {
  loading?: boolean;
  onSubmit: (altchaPayload: string) => void;
  onBack: () => void;
}

function Submit({ loading, onSubmit, onBack }: Props) {
  const altchaRef = useRef<AltchaHandle>(null);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const isAltchaValid = altchaPayload !== null;

  const handleSubmit = () => {
    if (!altchaPayload || loading) return;

    onSubmit(altchaPayload);
    altchaRef.current?.reset();
  };

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>人机验证</Card.Title>
        <Card.Description>完成人机验证以提交注册信息</Card.Description>
        <Chip className="absolute top-0 right-0">5 / 5</Chip>
      </Card.Header>
      <Card.Content className="flex w-100 max-w-full flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label>人机验证</Label>
          <Altcha ref={altchaRef} onPayload={setAltchaPayload} />
        </div>
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
            onPress={handleSubmit}
          >
            提交注册申请
          </Button>
        </div>
      </Card.Footer>
    </>
  );
}

export default Submit;
