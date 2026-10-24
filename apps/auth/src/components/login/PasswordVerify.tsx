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
import { LucideLock, LucideUser2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import Altcha from "../Altcha.tsx";

interface Props {
  loading?: boolean;
  onSubmit: (username: string, password: string, remember: boolean, altchaPayload: string) => void;
}

function PasswordVerify({ loading, onSubmit }: Props) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const isUsernameValid = /^[a-zA-Z0-9_-]{4,32}$/.test(username);
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/.test(password);
  const isAltchaValid = altchaPayload !== null;

  const handleSubmit = () => {
    if (isUsernameValid && isPasswordValid && isAltchaValid) {
      onSubmit(username, password, remember, altchaPayload || "");
    }
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>登录</Card.Title>
        <Card.Description>请登录以访问复旦附中数字资源站</Card.Description>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <TextField
          name="identifier"
          type="text"
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
              onKeyDown={handleEnter}
            />
          </InputGroup>
          <FieldError>请输入有效的用户名</FieldError>
        </TextField>
        <TextField
          name="password"
          type="password"
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
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              onKeyDown={handleEnter}
            />
          </InputGroup>
          <FieldError>请输入有效的密码</FieldError>
        </TextField>
        <div className="flex flex-col gap-1">
          <Label>人机验证</Label>
          <Altcha onPayload={setAltchaPayload} />
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
          <Link className="text-accent hover:text-accent-hover text-sm no-underline" href="#">
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
