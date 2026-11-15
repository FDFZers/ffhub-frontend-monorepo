import {
  Button,
  Card,
  FieldError,
  InputGroup,
  Label,
  Link,
  TextField,
  Typography,
} from "@heroui/react";
import { isValidRegisterRequestID } from "@repo/shared/utils/validation.ts";
import { LucideHash } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import Altcha, { type AltchaHandle } from "../Altcha.tsx";

interface Props {
  loading?: boolean;
  onSubmit: (id: string, altchaPayload: string) => Promise<void>;
}

function Query({ loading, onSubmit }: Props) {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [id, setId] = useState(() => searchParams.get("id") ?? "");
  const altchaRef = useRef<AltchaHandle>(null);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const isIDValid = isValidRegisterRequestID(id);
  const isAltchaValid = altchaPayload !== null;

  const handleSubmit = () => {
    if (!isIDValid || !altchaPayload || loading) return;

    void onSubmit(id, altchaPayload);
    altchaRef.current?.reset();
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
              placeholder="请输入注册申请 ID"
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
          <Altcha ref={altchaRef} onPayload={setAltchaPayload} />
        </div>
      </Card.Content>
      <Card.Footer className="mt-4 flex flex-col gap-2">
        <Button
          className="w-full"
          isDisabled={!isIDValid || !isAltchaValid || loading}
          isPending={loading}
          onPress={handleSubmit}
        >
          查询审批状态
        </Button>
        <Typography color="muted" type="body-sm">
          没有账号？
          <Link
            className="text-accent hover:text-accent-hover no-underline"
            onClick={() => navigate("/register")}
          >
            立即注册
          </Link>
        </Typography>
      </Card.Footer>
    </>
  );
}

export default Query;
