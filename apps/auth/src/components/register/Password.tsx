import { Button, Card, Chip, FieldError, InputGroup, Label, TextField } from "@heroui/react";
import { Tooltip } from "@repo/shared/components/Tooltip.tsx";
import { isValidPassword } from "@repo/shared/utils/validation.ts";
import { Eye, EyeOff, LucideInfo, LucideLock } from "lucide-react";
import { useState } from "react";

interface Props {
  initial: string;
  onNext: (password: string) => void;
  onBack: () => void;
}

function Password({ initial, onNext, onBack }: Props) {
  const [password, setPassword] = useState(initial);
  const [confirm, setConfirm] = useState(initial);
  const [isVisible, setIsVisible] = useState(false);

  const isPasswordValid = isValidPassword(password);
  const isConfirmValid = confirm.length > 0 && confirm === password;

  const handleSubmit = () => {
    if (isPasswordValid && isConfirmValid) onNext(password);
  };

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>设置密码</Card.Title>
        <Card.Description>请设置你的登录密码</Card.Description>
        <Chip className="absolute top-0 right-0">2 / 5</Chip>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <TextField
          name="password"
          type="password"
          autoComplete="new-password"
          isInvalid={password.length > 0 && !isPasswordValid}
        >
          <Label>密码</Label>
          <div className="flex gap-2">
            <InputGroup variant="secondary" className="grow">
              <InputGroup.Prefix>
                <LucideLock className="text-muted size-4" />
              </InputGroup.Prefix>
              <InputGroup.Input
                placeholder="请输入密码…"
                value={password}
                type={isVisible ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
              <InputGroup.Suffix className="pe-0">
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>
              </InputGroup.Suffix>
            </InputGroup>
            <Tooltip delay={0}>
              <Button variant="tertiary" isIconOnly aria-label="密码格式说明">
                <LucideInfo />
              </Button>
              <Tooltip.Content>
                <strong>密码格式：</strong>
                <ul className="list-disc pl-4">
                  <li>8-32 个字符</li>
                  <li>必须包含大小写字母</li>
                  <li>必须包含数字</li>
                  <li>可包含特殊字符</li>
                </ul>
              </Tooltip.Content>
            </Tooltip>
          </div>
          <FieldError>请输入有效的密码</FieldError>
        </TextField>
        <TextField
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          isInvalid={confirm.length > 0 && !isConfirmValid}
        >
          <Label>确认密码</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <LucideLock className="text-muted size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="请再次输入密码…"
              value={confirm}
              type={isVisible ? "text" : "password"}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            <InputGroup.Suffix className="pe-0">
              <Button isIconOnly size="sm" variant="ghost" onPress={() => setIsVisible(!isVisible)}>
                {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
          <FieldError>两次输入的密码不一致</FieldError>
        </TextField>
      </Card.Content>
      <Card.Footer className="mt-4 flex justify-between gap-2">
        <Button className="w-full" variant="tertiary" onPress={onBack}>
          上一步
        </Button>
        <Button
          className="w-full"
          isDisabled={!isPasswordValid || !isConfirmValid}
          onPress={handleSubmit}
        >
          下一步
        </Button>
      </Card.Footer>
    </>
  );
}

export default Password;
