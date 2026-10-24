import type { TwoFactorMethod } from "@repo/commons/api/auth/types.ts";

import { Button, Card, Description, Label, ListBox } from "@heroui/react";
import { SiQq } from "@icons-pack/react-simple-icons";
import { LucideMail, LucideRectangleEllipsis, LucideUndo2 } from "lucide-react";

interface Props {
  methods: TwoFactorMethod[];
  onSelect: (method: TwoFactorMethod) => void;
  onBack: () => void;
}

function Select2FA({ methods, onSelect, onBack }: Props) {
  return (
    <>
      <Card.Header className="mb-2">
        <Card.Title>二次验证</Card.Title>
        <Card.Description>请选择二次验证方式以完成登录</Card.Description>
      </Card.Header>
      <Card.Content>
        <ListBox
          className="w-100 max-w-full"
          selectionMode="single"
          onSelectionChange={(keys) => {
            const first = Array.from(keys)[0];
            if (first) onSelect(first as TwoFactorMethod);
          }}
        >
          {methods.includes("email") && (
            <ListBox.Item id="email" textValue="email">
              <LucideMail />
              <div className="flex flex-col">
                <Label>邮箱</Label>
                <Description>发送邮箱验证码</Description>
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
          {methods.includes("qq") && (
            <ListBox.Item id="qq" textValue="qq">
              <SiQq />
              <div className="flex flex-col">
                <Label>QQ</Label>
                <Description>向 QQ 机器人发送验证码</Description>
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
          {methods.includes("totp") && (
            <ListBox.Item id="totp" textValue="totp">
              <LucideRectangleEllipsis />
              <div className="flex flex-col">
                <Label>TOTP</Label>
                <Description>通过 TOTP 验证码验证</Description>
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </Card.Content>
      <Card.Footer className="mt-4">
        <Button className="w-full" variant="tertiary" onPress={onBack}>
          <LucideUndo2 /> 返回
        </Button>
      </Card.Footer>
    </>
  );
}

export default Select2FA;
