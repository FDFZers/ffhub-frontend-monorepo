import type { PasswordResetMethod } from "@repo/shared/api/auth/types.ts";

import { Button, Card, CloseButton, FieldError, InputGroup, Label, TextField } from "@heroui/react";
import { SiQq } from "@icons-pack/react-simple-icons";
import { isValidEmail, isValidQQ } from "@repo/shared/utils/validation.ts";
import { LucideMail, LucideUndo2 } from "lucide-react";
import { useRef, useState } from "react";

import Altcha, { type AltchaHandle } from "../Altcha.tsx";

interface Props {
  method: PasswordResetMethod;
  loading?: boolean;
  onSubmit: (identifier: string, altchaPayload: string) => Promise<void>;
  /** 返回上一步（重新选择找回方式）。 */
  onBack: () => void;
  /** 关闭当前流程，返回登录。 */
  onExit: () => void;
}

function Identifier({ method, loading, onSubmit, onBack, onExit }: Props) {
  const altchaRef = useRef<AltchaHandle>(null);
  const [identifier, setIdentifier] = useState("");
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const isEmail = method === "email";
  const isIdentifierValid = isEmail ? isValidEmail(identifier) : isValidQQ(identifier);
  const isAltchaValid = altchaPayload !== null;

  const handleSubmit = () => {
    if (!isIdentifierValid || !altchaPayload || loading) return;

    void onSubmit(identifier, altchaPayload);
    // Altcha challenge 只能消费一次，失败后需要重新验证。
    altchaRef.current?.reset();
  };

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>{isEmail ? "邮箱找回" : "QQ 找回"}</Card.Title>
        <Card.Description>
          {isEmail
            ? "请输入绑定的邮箱，验证码将发送到该邮箱"
            : "请输入绑定的 QQ 号，验证码将通过机器人发送"}
        </Card.Description>
        <CloseButton className="absolute top-2 right-2" aria-label="返回登录" onPress={onExit}>
          <LucideUndo2 />
        </CloseButton>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <TextField
          name={isEmail ? "email" : "qq"}
          type="text"
          autoComplete={isEmail ? "email" : "off"}
          isInvalid={identifier.length > 0 && !isIdentifierValid}
        >
          <Label>{isEmail ? "邮箱" : "QQ 号"}</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              {isEmail ? (
                <LucideMail className="text-muted size-4" />
              ) : (
                <SiQq className="text-muted size-4" />
              )}
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder={isEmail ? "请输入绑定的邮箱…" : "请输入绑定的 QQ 号…"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </InputGroup>
          <FieldError>{isEmail ? "请输入有效的邮箱地址" : "请输入有效的 QQ 号"}</FieldError>
        </TextField>
        <div className="flex flex-col gap-1">
          <Label>人机验证</Label>
          <Altcha ref={altchaRef} onPayload={setAltchaPayload} />
        </div>
      </Card.Content>
      <Card.Footer className="mt-4 flex justify-between gap-2">
        <Button className="w-full" variant="tertiary" isDisabled={loading} onPress={onBack}>
          上一步
        </Button>
        <Button
          className="w-full"
          isDisabled={!isIdentifierValid || !isAltchaValid || loading}
          isPending={loading}
          onPress={handleSubmit}
        >
          下一步
        </Button>
      </Card.Footer>
    </>
  );
}

export default Identifier;
