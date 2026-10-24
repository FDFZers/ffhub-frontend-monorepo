import {
  Button,
  Card,
  Chip,
  FieldError,
  InputGroup,
  Label,
  Link,
  TextField,
  Tooltip,
  Typography,
} from "@heroui/react";
import { LucideHash, LucideInfo } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

interface Props {
  initial: { username: string; nickname: string };
  onNext: (v: { username: string; nickname: string }) => void;
}

function Username({ initial, onNext }: Props) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(initial.username);
  const [nickname, setNickname] = useState(initial.nickname);

  const isUsernameValid = /^[a-zA-Z0-9_-]{4,32}$/.test(username);
  const isNicknameValid = nickname.length >= 1 && nickname.length <= 32;

  const handleSubmit = () => {
    if (isUsernameValid && isNicknameValid) onNext({ username, nickname });
  };

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>创建账号</Card.Title>
        <Card.Description>欢迎注册复旦附中学生 ID</Card.Description>
        <Chip className="absolute top-0 right-0">1 / 6</Chip>
      </Card.Header>
      <Card.Content>
        <div className="flex w-md max-w-full flex-col gap-4">
          <TextField
            name="username"
            type="text"
            isInvalid={username.length > 0 && !isUsernameValid}
          >
            <Label>用户名</Label>
            <div className="flex gap-2">
              <InputGroup variant="secondary" className="grow">
                <InputGroup.Prefix>
                  <LucideHash className="text-muted size-4" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  placeholder="给自己取个 ID 吧～"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </InputGroup>
              <Tooltip delay={0}>
                <Button variant="tertiary" isIconOnly>
                  <LucideInfo />
                </Button>
                <Tooltip.Content>
                  <strong>用户名格式：</strong>
                  <ul className="list-disc pl-4">
                    <li>4-32 个字符</li>
                    <li>大小写字母</li>
                    <li>数字</li>
                    <li>连字符和下划线</li>
                  </ul>
                </Tooltip.Content>
              </Tooltip>
            </div>
            <FieldError>请输入有效的用户名</FieldError>
          </TextField>
          <TextField
            name="nickname"
            type="text"
            isInvalid={nickname.length > 0 && !isNicknameValid}
          >
            <Label>昵称</Label>
            <div className="flex gap-2">
              <InputGroup variant="secondary" className="grow">
                <InputGroup.Prefix>
                  <LucideHash className="text-muted size-4" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  placeholder="给自己起个名字吧～"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </InputGroup>
              <Tooltip delay={0}>
                <Button variant="tertiary" isIconOnly>
                  <LucideInfo />
                </Button>
                <Tooltip.Content>
                  <strong>昵称格式：</strong>
                  <ul className="list-disc pl-4">
                    <li>1-32 个字符</li>
                    <li>任何字符～</li>
                  </ul>
                </Tooltip.Content>
              </Tooltip>
            </div>
            <FieldError>请输入有效的昵称</FieldError>
          </TextField>
        </div>
      </Card.Content>
      <Card.Footer className="mt-4 flex flex-col gap-2">
        <Button
          className="w-full"
          isDisabled={!isUsernameValid || !isNicknameValid}
          onPress={handleSubmit}
        >
          下一步
        </Button>
        <Typography color="muted" type="body-sm">
          已有账号？
          <Link
            className="text-accent hover:text-accent-hover no-underline"
            onClick={() => navigate("/login")}
          >
            立即登录
          </Link>
        </Typography>
      </Card.Footer>
    </>
  );
}

export default Username;
