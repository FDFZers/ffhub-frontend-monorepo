import { Button, Card, FieldError, InputGroup, Label, TextField, Tooltip } from "@heroui/react";
import { isValidPassword } from "@repo/shared/utils/validation.ts";
import { Eye, EyeOff, LucideInfo, LucideLock } from "lucide-react";
import { useState } from "react";

interface Props {
  description?: string;
  loading?: boolean;
  onSubmit: (password: string) => void;
  onBack: () => void;
}

function NewPassword({ description, loading, onSubmit, onBack }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const isPasswordValid = isValidPassword(password);
  const isConfirmValid = confirm.length > 0 && confirm === password;

  const handleSubmit = () => {
    if (!isPasswordValid || !isConfirmValid || loading) return;
    onSubmit(password);
  };

  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>设置新密码</Card.Title>
        <Card.Description>{description ?? "请设置你的新登录密码"}</Card.Description>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <TextField
          name="password"
          type="password"
          autoComplete="new-password"
          isInvalid={password.length > 0 && !isPasswordValid}
        >
          <Label>新密码</Label>
          <div className="flex gap-2">
            <InputGroup variant="secondary" className="grow">
              <InputGroup.Prefix>
                <LucideLock className="text-muted size-4" />
              </InputGroup.Prefix>
              <InputGroup.Input
                placeholder="请输入新密码…"
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
                  aria-label={isVisible ? "隐藏密码" : "显示密码"}
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
          <FieldError>请输入有效的新密码</FieldError>
        </TextField>
        <TextField
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          isInvalid={confirm.length > 0 && !isConfirmValid}
        >
          <Label>确认新密码</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <LucideLock className="text-muted size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="请再次输入新密码…"
              value={confirm}
              type={isVisible ? "text" : "password"}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            <InputGroup.Suffix className="pe-0">
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label={isVisible ? "隐藏密码" : "显示密码"}
                onPress={() => setIsVisible(!isVisible)}
              >
                {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
          <FieldError>两次输入的密码不一致</FieldError>
        </TextField>
      </Card.Content>
      <Card.Footer className="mt-4 flex justify-between gap-2">
        <Button className="w-full" variant="tertiary" isDisabled={loading} onPress={onBack}>
          返回登录
        </Button>
        <Button
          className="w-full"
          isDisabled={!isPasswordValid || !isConfirmValid || loading}
          isPending={loading}
          onPress={handleSubmit}
        >
          重置密码
        </Button>
      </Card.Footer>
    </>
  );
}

export default NewPassword;
