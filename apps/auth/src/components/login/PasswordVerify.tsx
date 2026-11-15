import {
  Button,
  Card,
  Checkbox,
  FieldError,
  InputGroup,
  Label,
  Link,
  TextField,
  Typography,
} from "@heroui/react";
import { isValidPassword, isValidUsername } from "@repo/shared/utils/validation.ts";
import { Eye, EyeOff, LucideLock, LucideUser2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

import Altcha, { type AltchaHandle } from "../Altcha.tsx";

interface Props {
  loading?: boolean;
  onSubmit: (username: string, password: string, remember: boolean, altchaPayload: string) => void;
}

function PasswordVerify({ loading, onSubmit }: Props) {
  const navigate = useNavigate();
  const altchaRef = useRef<AltchaHandle>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const isUsernameValid = isValidUsername(username);
  const isPasswordValid = isValidPassword(password);
  const isAltchaValid = altchaPayload !== null;

  const handleSubmit = () => {
    if (!isUsernameValid || !isPasswordValid || !altchaPayload) return;

    onSubmit(username, password, remember, altchaPayload);
    altchaRef.current?.reset();
  };

  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>登录</Card.Title>
        <Card.Description>请登录以访问复旦附中数字资源站</Card.Description>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <TextField
          name="username"
          type="text"
          autoComplete="username"
          isInvalid={username.length > 0 && !isUsernameValid}
        >
          <Label>用户名</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <LucideUser2 className="text-muted size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="请输入用户名…"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </InputGroup>
          <FieldError>请输入有效的用户名</FieldError>
        </TextField>
        <TextField
          name="password"
          type="password"
          autoComplete="current-password"
          isInvalid={password.length > 0 && !isPasswordValid}
        >
          <Label>密码</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <LucideLock className="text-muted size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="请输入密码…"
              value={password}
              type={isVisible ? "text" : "password"}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
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
          <FieldError>请输入有效的密码</FieldError>
        </TextField>
        <div className="flex flex-col gap-1">
          <Label>人机验证</Label>
          <Altcha onPayload={setAltchaPayload} ref={altchaRef} />
        </div>
        <div className="flex justify-between">
          <Checkbox
            name="remember"
            variant="secondary"
            isSelected={remember}
            onChange={setRemember}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              记住此设备
            </Checkbox.Content>
          </Checkbox>
          <Link
            className="text-accent hover:text-accent-hover text-sm no-underline"
            onPress={() => navigate("/reset_password")}
          >
            忘记密码？
          </Link>
        </div>
      </Card.Content>
      <Card.Footer className="mt-4 flex flex-col gap-2">
        <Button
          className="w-full"
          isDisabled={!isUsernameValid || !isPasswordValid || !isAltchaValid}
          isPending={loading}
          onPress={handleSubmit}
        >
          登录
        </Button>
        <Typography color="muted" type="body-sm">
          还没有账号？
          <Link
            className="text-accent hover:text-accent-hover no-underline"
            onPress={() => navigate("/register")}
          >
            立即注册
          </Link>
        </Typography>
      </Card.Footer>
    </>
  );
}

export default PasswordVerify;
