import { Button, Card, FieldError, InputGroup, Label, TextField } from "@heroui/react";
import { LucideHash } from "lucide-react";
import { useState } from "react";

import Altcha from "../Altcha.tsx";

interface Props {
  loading?: boolean;
  onSubmit: (id: string, altchaPayload: string) => Promise<void>;
}

function Query({ loading, onSubmit }: Props) {
  const [id, setId] = useState("");
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const isIDValid = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    id,
  );
  const isAltchaValid = altchaPayload !== null;

  const handleSubmit = async () => {
    onSubmit(id, altchaPayload!);
  };

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>查询审批状态</Card.Title>
        <Card.Description>凭注册申请 ID 查询你的注册申请审核进度</Card.Description>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <TextField name="register_request_id" type="text" isInvalid={id.length > 0 && !isIDValid}>
          <Label>注册申请 ID</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <LucideHash className="text-muted size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              className="font-mono"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </InputGroup>
          <FieldError>请输入有效的注册申请 ID</FieldError>
        </TextField>
        <div className="flex flex-col gap-1">
          <Label>人机验证</Label>
          <Altcha onPayload={setAltchaPayload} />
        </div>
      </Card.Content>
      <Card.Footer className="mt-4 flex flex-col gap-2">
        <Button
          className="w-full"
          isDisabled={!isIDValid || !isAltchaValid}
          isPending={loading}
          onPress={() => handleSubmit()}
        >
          查询审批状态
        </Button>
      </Card.Footer>
    </>
  );
}

export default Query;
