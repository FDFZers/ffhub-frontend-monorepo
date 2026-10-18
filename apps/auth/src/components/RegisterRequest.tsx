import {
  Button,
  Card,
  Description,
  InputGroup,
  Label,
  Link,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@heroui/react";
import { LucideHash, LucideIdCard } from "lucide-react";

import { DropZone } from "@repo/commons/components/DropZone.tsx";

function RegisterRequest() {
  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>创建账号</Card.Title>
        <Card.Description>欢迎注册复旦附中学生 ID</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="flex w-md max-w-full flex-col gap-4">
          <TextField name="identifier" type="text">
            <Label>学号</Label>
            <InputGroup variant="secondary">
              <InputGroup.Prefix>
                <LucideHash className="text-muted size-4" />
              </InputGroup.Prefix>
              <InputGroup.Input placeholder="20290101" />
            </InputGroup>
          </TextField>
          <TextField name="real_name" type="text">
            <Label>真实姓名</Label>
            <InputGroup variant="secondary">
              <InputGroup.Prefix>
                <LucideIdCard className="text-muted size-4" />
              </InputGroup.Prefix>
              <InputGroup.Input placeholder="某某某" />
            </InputGroup>
          </TextField>
          <RadioGroup defaultValue="fdfz" name="school" variant="secondary">
            <Label>所在学校</Label>
            <Radio value="fdfz">
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                复附本部
              </Radio.Content>
            </Radio>
            <Radio value="ffxh">
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                徐汇分校
              </Radio.Content>
            </Radio>
            <Radio value="ffqp">
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                青浦分校
              </Radio.Content>
            </Radio>
            <Radio value="ffpd">
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                浦东分校
              </Radio.Content>
            </Radio>
            <Radio value="ffja">
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                静安分校
              </Radio.Content>
            </Radio>
          </RadioGroup>
          <DropZone
            config={{
              maxSize: 2 * 1024 * 1024, // 2MB
              accept: ["image/png", "image/jpeg", "image/heif"],
            }}
          >
            <div className="mb-4 flex flex-col">
              <Label>身份证明</Label>
              <Description>
                请提供能证明身份的材料，例如校园卡照片、校园网个人页面截图等
              </Description>
            </div>
            <DropZone.Area>
              <DropZone.Icon />
              <DropZone.Label />
              <DropZone.Description />
              <DropZone.Trigger />
            </DropZone.Area>
            <DropZone.Input />
          </DropZone>
        </div>
      </Card.Content>
      <Card.Footer className="mt-4 flex flex-col gap-2">
        <Button className="w-full">提交注册申请</Button>
        <Typography color="muted" type="body-sm">
          已有账号？
          <Link className="text-accent hover:text-accent-hover no-underline" href="#">
            立即登录
          </Link>
        </Typography>
      </Card.Footer>
    </>
  );
}

export default RegisterRequest;
