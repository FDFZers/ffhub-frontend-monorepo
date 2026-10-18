import { Button, Card, Description, Label, Switch, Tooltip, Typography } from "@heroui/react";
import { LucideArrowRight, LucideCircleQuestionMark, LucideMail, LucideUser2 } from "lucide-react";

function OAuthRequest() {
  return (
    <>
      <div className="mb-8 flex items-center justify-center gap-10">
        <img src="/assets/images/fdfz.png" alt="" className="size-24" />
        <LucideArrowRight className="text-muted size-10" />
        <img src="/assets/images/fdfz.png" alt="" className="size-24" />
      </div>
      <Card>
        <Card.Header>
          <Card.Title>应用授权</Card.Title>
          <Card.Description>“复旦附中 Wiki”请求访问你的账户以提供个性化服务</Card.Description>
        </Card.Header>
        <Card.Content className="flex w-lg flex-col gap-2">
          <Typography type="h4" className="text-sm font-medium">
            必要权限
          </Typography>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <LucideUser2 className="size-6" />
                <div className="flex flex-col">
                  <Label>获取账号信息</Label>
                  <Description>Student ID｜读取你的用户 ID、用户名、头像等基本信息</Description>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <LucideMail className="size-6" />
                <div className="flex flex-col">
                  <Label>获取联系信息</Label>
                  <Description>Student ID｜读取你的邮箱地址与 QQ 号</Description>
                </div>
              </div>
              <Tooltip delay={0}>
                <Button isIconOnly size="sm" variant="tertiary">
                  <LucideCircleQuestionMark />
                </Button>
                <Tooltip.Content showArrow>
                  <Tooltip.Arrow />
                  <p>应用需获取联系方式以把你开盒</p>
                </Tooltip.Content>
              </Tooltip>
            </div>
          </div>
          <Typography type="h4" className="text-sm font-medium">
            可选权限
          </Typography>
          <div>
            <Switch>
              <Switch.Content className="flex w-full justify-between">
                <div className="flex items-center gap-2">
                  <LucideMail className="size-6" />
                  <div className="flex flex-col">
                    <Label>获取账号密码</Label>
                    <Description className="font-normal">Student ID｜读取你的账号密码</Description>
                  </div>
                </div>
                <Tooltip delay={0}>
                  <Tooltip.Trigger>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Tooltip.Trigger>
                  <Tooltip.Content showArrow>
                    <Tooltip.Arrow />
                    <p>应用需获取密码以把你盗号了</p>
                  </Tooltip.Content>
                </Tooltip>
              </Switch.Content>
            </Switch>
          </div>
        </Card.Content>
        <Card.Footer className="mt-4 flex flex-col justify-center gap-2">
          <div className="flex w-full justify-between gap-2">
            <Button className="w-full" variant="tertiary">
              取消
            </Button>
            <Button className="w-full">授权</Button>
          </div>
          <Typography color="muted" type="body-xs">
            你可以随时在账户设置中更改或撤销此授权
          </Typography>
        </Card.Footer>
      </Card>
    </>
  );
}

export default OAuthRequest;
