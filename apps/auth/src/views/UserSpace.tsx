import { Avatar, Button, Card, Chip, Tabs, Typography } from "@heroui/react";
import {
  LucideClock,
  LucideGraduationCap,
  LucideHash,
  LucideMinus,
  LucidePlus,
  LucideTriangleAlert,
  LucideUser2,
} from "lucide-react";

function UserSpace() {
  return (
    <>
      <img
        src="https://ffwiki.top/%E7%99%BB%E5%BD%95%E8%83%8C%E6%99%AF.png"
        alt=""
        className="h-58 w-full [mask-image:linear-gradient(to_bottom,black_calc(100%-2rem),transparent)] object-cover"
      />
      <div className="relative bottom-12 mx-auto flex w-full max-w-400 flex-col gap-8 px-8">
        <Card className="flex h-min flex-row justify-between">
          <Avatar className="border-surface absolute -top-10 left-8 size-29 rounded-full border-4 shadow-lg">
            <img src="https://q1.qlogo.cn/g?b=qq&nk=1577438625&s=640" alt="" />
          </Avatar>
          <div className="ml-38">
            <div className="flex items-center gap-2">
              <Typography type="h3">Tigercrl</Typography>
              <Chip variant="primary" color="accent">
                站长
              </Chip>
            </div>
            <Typography type="body-sm" color="muted">
              Coding for a better world!
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <Typography type="body-sm" color="muted">
                粉丝
              </Typography>
              <Typography type="h6">114514</Typography>
            </div>
            <div>
              <Typography type="body-sm" color="muted">
                关注
              </Typography>
              <Typography type="h6">114514</Typography>
            </div>
            <Button className="ml-2">
              <LucidePlus />
              关注
            </Button>
          </div>
        </Card>
        <div className="flex gap-8">
          <div className="grow">
            <Tabs className="w-2xs">
              <Tabs.ListContainer>
                <Tabs.List>
                  <Tabs.Tab>
                    个人介绍
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab>
                    成就
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab>
                    留言板
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>
          <div className="flex w-2xs flex-col gap-8">
            <Card>
              <Card.Header>
                <Card.Title>基本信息</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="flex items-center gap-2">
                  <LucideUser2 className="size-4" />
                  <Typography type="body-sm" className="">
                    用户 ID
                  </Typography>
                  <LucideMinus className="text-muted size-4" />
                  <Typography type="body-sm" className="font-medium">
                    1
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <LucideHash className="size-4" />
                  <Typography type="body-sm">学号</Typography>
                  <LucideMinus className="text-muted size-4" />
                  <Typography type="body-sm" className="font-medium">
                    20291302
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <LucideGraduationCap className="size-4" />
                  <Typography type="body-sm">学校</Typography>
                  <LucideMinus className="text-muted size-4" />
                  <Typography type="body-sm" className="font-medium">
                    复附本部
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <LucideClock className="size-4" />
                  <Typography type="body-sm">注册时间</Typography>
                  <LucideMinus className="text-muted size-4" />
                  <Typography type="body-sm" className="font-medium">
                    2026/09/01
                  </Typography>
                </div>
              </Card.Content>
            </Card>
            <Card>
              <Card.Header>
                <Card.Title>勋章墙</Card.Title>
              </Card.Header>
              <Card.Content></Card.Content>
            </Card>
            <div className="flex w-full justify-center">
              <Button variant="outline" className="text-muted" size="sm">
                <LucideTriangleAlert />
                举报该用户
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserSpace;
