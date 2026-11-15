import { Card, Typography } from "@heroui/react";
import DynamicDiv from "@repo/shared/components/DynamicDiv.tsx";
import { Outlet } from "react-router";

function AuthLayout() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-evenly md:justify-center">
      <div className="mb-8 flex items-center justify-center gap-4">
        <img src="/assets/images/fdfz.png" alt="" className="size-17" />
        <div>
          <Typography type="h2" className="m-0">
            复旦附中学生 ID
          </Typography>
          <Typography color="muted" type="h4" className="m-0">
            FDFZ Student ID
          </Typography>
        </div>
      </div>
      <Card className="max-w-[calc(100%-2rem)]">
        <DynamicDiv>
          <Outlet />
        </DynamicDiv>
      </Card>

      <p className="text-muted mt-4 text-center text-xs sm:mt-6">复旦附中数字资源站 · FFHub</p>
    </div>
  );
}

export default AuthLayout;
