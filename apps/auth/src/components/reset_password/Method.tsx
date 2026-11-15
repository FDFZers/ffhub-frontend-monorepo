import type { PasswordResetMethod } from "@repo/shared/api/auth/types.ts";

import { Button, Card, CloseButton, Description, Label, ListBox, Typography } from "@heroui/react";
import { SiQq } from "@icons-pack/react-simple-icons";
import { LucideMail, LucideUndo2 } from "lucide-react";
import { useState } from "react";

interface Props {
  onSelect: (method: PasswordResetMethod) => void;
  onBack: () => void;
}

function Method({ onSelect, onBack }: Props) {
  // 与二次验证方式选择一致：选中后立即清空，由父组件切换到下一步。
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>找回密码</Card.Title>
        <Card.Description>请选择接收验证码的方式</Card.Description>
        <CloseButton className="absolute top-2 right-2" aria-label="返回" onPress={onBack}>
          <LucideUndo2 />
        </CloseButton>
      </Card.Header>
      <Card.Content className="flex w-100 max-w-full flex-col gap-4">
        <ListBox
          className="w-full"
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={(keys) => {
            const first = Array.from(keys)[0];
            if (first !== "email" && first !== "qq") return;
            setSelectedKeys([]);
            onSelect(first);
          }}
        >
          <ListBox.Item id="email" textValue="邮箱">
            <LucideMail />
            <div className="flex flex-col">
              <Label>邮箱</Label>
              <Description>通过绑定的邮箱接收验证码</Description>
            </div>
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="qq" textValue="QQ">
            <SiQq />
            <div className="flex flex-col">
              <Label>QQ</Label>
              <Description>通过绑定的 QQ 接收验证码</Description>
            </div>
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </Card.Content>
      <Typography type="body-xs" color="muted">
        若账号未绑定邮箱或 QQ，将无法通过此方式找回密码，请联系管理员。
      </Typography>
      <Card.Footer className="mt-4">
        <Button className="w-full" variant="tertiary" onPress={onBack}>
          返回登录
        </Button>
      </Card.Footer>
    </>
  );
}

export default Method;
