import {
  Button,
  Card,
  Chip,
  FieldError,
  InputGroup,
  Label,
  Link,
  TextField,
  Typography,
} from "@heroui/react";
import Tooltip from "@repo/shared/components/Tooltip.tsx";
import { isValidNickname, isValidUsername } from "@repo/shared/utils/validation.ts";
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

  const isUsernameValid = isValidUsername(username);
  // 昵称是选填项；留空时后端会使用用户名作为展示名。
  const isNicknameValid = nickname === "" || isValidNickname(nickname);
  const isNicknameInvalid = nickname !== "" && !isNicknameValid;

  const handleSubmit = () => {
    if (isUsernameValid && isNicknameValid) onNext({ username, nickname });
  };

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>创建账号</Card.Title>
        <Card.Description>欢迎注册复旦附中学生 ID</Card.Description>
        <Chip className="absolute top-0 right-0">1 / 5</Chip>
      </Card.Header>
      <Card.Content>
        <div className="flex w-md max-w-full flex-col gap-4">
          <TextField
            name="username"
            type="text"
            autoComplete="username"
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
                <Button variant="tertiary" isIconOnly aria-label="用户名格式说明">
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
          <TextField name="nickname" type="text" isInvalid={isNicknameInvalid}>
            <Label>昵称（可选）</Label>
            <div className="flex gap-2">
              <InputGroup variant="secondary" className="grow">
                <InputGroup.Prefix>
                  <LucideHash className="text-muted size-4" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  placeholder="可选，默认使用用户名"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </InputGroup>
              <Tooltip delay={0}>
                <Button variant="tertiary" isIconOnly aria-label="昵称格式说明">
                  <LucideInfo />
                </Button>
                <Tooltip.Content>
                  <strong>昵称格式：</strong>
                  <ul className="list-disc pl-4">
                    <li>1-32 个任意字符</li>
                    <li>留空时显示用户名</li>
                  </ul>
                </Tooltip.Content>
              </Tooltip>
            </div>
            <FieldError>昵称长度需为 1-32 个字符</FieldError>
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
          </Link>{" "}
          或{" "}
          <Link
            className="text-accent hover:text-accent-hover no-underline"
            onClick={() => navigate("/reg_status")}
          >
            查询审核状态
          </Link>
        </Typography>
      </Card.Footer>
    </>
  );
}

export default Username;
